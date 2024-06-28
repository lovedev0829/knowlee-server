import { Request, Response } from "express";
import { ClientSession } from "mongoose";
import * as pdfjsLib from "pdfjs-dist";
import { TextItem } from "pdfjs-dist/types/src/display/api";
import { v4 as uuidv4 } from "uuid";
import { LocalEntityModel } from "../models/localEntity.model";
import { PdfRecordModel } from "../models/records/pdfRecord.model";
import { UserKnowledgeModel } from "../models/userKnowledge.model";
import { getUser } from "../services/user.services";
import { SOURCE_TYPES } from "../types";
import { PdfRecordMetadata, PdfRecordPageContent } from "../types/record";
import { RequestError } from "../utils/globalErrorHandler";
import { sendResponse } from "../utils/response.utils";
import { getPdfTextWithPages } from "../utils/upload.utils";
import { processFileContent } from "../services/documentChat.services";
import { DocRecordModel } from "../models/docRecord.model";
import { createAndUpsertPineconeVectorViaApify } from "../services/pinecone.services";
import { createUserVector } from "../services/userVector.services";
import { findOneAndUpdateUserUsageStatDocument } from "../services/userUsageStat.services";
import { processuploadAudioRecord } from "../services/audioRecord.service";
import { encode } from "gpt-3-encoder";
import { saveOpenAIFileIdIntoEntity } from "../services/knowlee-agent/agent.services";
import { uploadImagesForInterpretationOnS3Bucket } from "../services/upload.services";


export const uploadPdfDocument = async (req: Request, res: Response) => {
  const session: ClientSession = req.session!;

  if (!req.file) throw new RequestError("No file uploaded", 400);

  const { userId } = req.body;
  if (!userId) throw new RequestError("User ID is required", 400);

  
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(req.file.buffer),
    useSystemFonts: true,
  });
  
  try {
    const user = await getUser(userId, session);
    if (!user) throw new RequestError("User does not exist", 404);

    const pdf = await loadingTask.promise;
    const pages: PdfRecordPageContent[] = await getPdfTextWithPages(pdf);

    const meta = await pdf.getMetadata();
    // the type for info are any in the library I guess because the metadata is not always the same
    // TODO: test this more
    const metadata: PdfRecordMetadata = {
      author: (meta as any).info.Author || "",
      title: (meta as any).info.Title || "",
      subject: (meta as any).info.Subject || "",
      keywords: (meta as any).info.Keywords || "",
      producer: (meta as any).info.Producer || "",
      createdDate: Date.parse((meta as any).info.CreationDate) || Date.now(),
    };

    // create related entity
    const newPdfEntityId = uuidv4();
    // title at this moment doesn't always get caught from metadata, we could instead use the filename
    const newPdfLocalEntity = new LocalEntityModel({
      id: newPdfEntityId,
      value: metadata.title || req.file.originalname,
      fileName: req.file.originalname,
      sourceType: SOURCE_TYPES.PDF,
      subSetType: "",
      isScraped: false,
    });
    await newPdfLocalEntity.save({ session });

    const relatedPdfRecord = new PdfRecordModel({
      entityId: newPdfEntityId,
      metadata,
      pages,
    });
    await relatedPdfRecord.save({ session });

    // update user knowledge
    await UserKnowledgeModel.findOneAndUpdate(
      { userId: userId },
      { $push: { entities: newPdfEntityId } },
      { new: true, session: session }
    );

    return sendResponse(res, 200, "", relatedPdfRecord);
    return;
  } catch (error) {
    //console.log(error);
    throw new RequestError("Error parsing the PDF", 500);
  }
};


export const uploadDocumentFTB = async (req: Request, res: Response) => {
  const session: ClientSession = req.session!;

  if (!req.file) throw new RequestError("No file uploaded", 400);

  const { userId } = req.body;
  if (!userId) throw new RequestError("User ID is required", 400);

    const user = await getUser(userId, session);
    if (!user) throw new RequestError("User does not exist", 404);

    const {mimetype, buffer, originalname} = req.file;
    
    let newDocs;
    let text
    const isAudio =mimetype.startsWith('audio/');

    // Process the file based on its type
    if(isAudio){
      // Process audio file
      newDocs = await processuploadAudioRecord(userId, buffer, originalname);
      text = newDocs.map((item) => item.text).join(" ")
    }
    else {
       newDocs = await processFileContent(mimetype, buffer);
       text = newDocs.map((item) => item.pageContent).join(" ");
    }
    // //console.log("text----->", text);
     // count token and save it to entity
    const tokens = encode(text).length;

    // create related entity
    const newDocEntityId = uuidv4();
    const newLocalEntity = new LocalEntityModel({
      id: newDocEntityId,
      value: originalname,
      sourceType: mimetype,
      subSetType: isAudio ? "audio" : "document",
      isScraped: true,
      tokens: tokens,
    });
    await newLocalEntity.save({ session });

    const newDocRecord = new DocRecordModel({
      entityId: newDocEntityId,
      content: newDocs,
      fileType: mimetype,
    });
    await newDocRecord.save({ session });

  // Generating fileIds for local entities with docRecord
  await saveOpenAIFileIdIntoEntity([newDocRecord])

    // update user knowledge
    await UserKnowledgeModel.findOneAndUpdate(
      { userId: userId },
      { $push: { entities: newDocEntityId } },
      { new: true, session: session, upsert: true }
    );

  // increment localEntityCount
  await findOneAndUpdateUserUsageStatDocument(
    { userId: userId },
    {
      $inc: {
        localEntityCount: 1,
      },
    },
    { upsert: true, new: true }
  );

    sendResponse(res, 200, "", newDocRecord);

  // try {
  //   // Pinecone Embedding + Upserting
  //   const apifyResponse = await createAndUpsertPineconeVectorViaApify({
  //     namespace: userId,
  //     text: text,
  //   });

  //   if (!apifyResponse) {
  //     //console.log("something went wrong while getting apifyResponse");
  //     return;
  //   }

  //   // increment localEntityCount and totalEmbeddingTokenUsed
  //   const embeddingTokenUsed = apifyResponse.items?.reduce(
  //     (tokenCount, item) => {
  //       return tokenCount + (item?.token_count || 0);
  //     },
  //     0
  //   ) || 0;
  //   const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
  //     { userId: userId },
  //     {
  //       $inc: {
  //         totalEmbeddingTokenUsed: embeddingTokenUsed,
  //         localEntityCount: 1,
  //       },
  //     },
  //     { upsert: true, new: true }
  //   );

  //   // store user vectors
  //   const vectorsId = apifyResponse.items;
  //   await createUserVector({
  //     userId: userId,
  //     entityId: newDocEntityId,
  //     vectorsId: vectorsId,
  //   });
  //   return;
  // } catch (error) {
  //   //console.log(error);
  // }
};
   


export const uploadImageForInterpretation = async (
  req: Request,
  res: Response
) => {
  if (!req.file) throw new RequestError("No file uploaded", 400);

  const user = req.user;
  if (!user) throw new RequestError("User not found", 400);
  const userId = user.id
  if (!userId) throw new RequestError("User ID is required", 400);

  const uploadedImage = await uploadImagesForInterpretationOnS3Bucket(
    req.file,
    userId
  );

  return sendResponse(res, 200, "", uploadedImage);
};
   


