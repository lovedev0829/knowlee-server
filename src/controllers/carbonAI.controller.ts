import axios from "axios";
import {
  carbonAuthGetAccessToken,
  carbonFilesQueryUserFiles,
} from "../services/carbon/carbon.service";
import { OnSuccessData } from "../types/carbonAI.type";
import { RequestError } from "../utils/globalErrorHandler";
import { sendResponse } from "../utils/response.utils";
import { Request, Response } from "express";
import { findOneAndUpdateUserUsageStatDocument } from "../services/userUsageStat.services";
import {
  createEntityDocument,
  findOneEntity,
} from "../services/entity.services";
import {
  findOneAndUpdateUserKnowledge,
  findOneUserKnowledge,
} from "../services/userKnowledge.services";
import { v4 as uuidv4 } from "uuid";
import { createCarbonScrapedDocument } from "../services/carbonScraped.service";

export async function getCarbonAccessTokenController(
  req: Request,
  res: Response
) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;
  const data = await carbonAuthGetAccessToken({ customerId: userId });
  return sendResponse(res, 200, `success`, data);
}

export async function handleSuccessEventController(
  req: Request,
  res: Response
) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;
  const body = req.body as OnSuccessData;
  // console.log("req.body----->", JSON.stringify(body));
  const { data } = body;
  const file = data?.files?.[0];
  if (!file) {
    // console.log("File data not found");
    throw new RequestError("File data not found", 500);
  }
  // console.log("file----->", file);
  const { id: carbonFileId, external_url, source } = file;
  const sourceType = "carbon";
  const subSetType = source.toLowerCase();
  const value = external_url;

  // find for existing entity
  const existingEntity = await findOneEntity({
    value: value,
    sourceType: sourceType,
    subSetType: subSetType,
  });

  // find in userKnowledge of the user
  if (existingEntity) {
    const userKnowledge = await findOneUserKnowledge({
      entities: existingEntity.id,
      userId: userId,
    });

    if (userKnowledge) {
      // if entity is already created, and that entity is also present in userKnowledge
      // return success response
      return sendResponse(res, 200, `success`);
    } else {
      // add entityId to userKnowledge
      await findOneAndUpdateUserKnowledge(
        { userId: userId },
        // adds elements to an array only if they are not already present.
        { $addToSet: { entities: existingEntity.id } },
        { new: true, upsert: true }
      );
      // increment entityCount in userUsageStat
      await findOneAndUpdateUserUsageStatDocument(
        { userId: userId },
        { $inc: { [`entityCount.${sourceType}.${subSetType}`]: 1 } },
        { upsert: true, new: true }
      );
      // return success response
      return sendResponse(res, 200, `success`);
    }
  }

  // query user files from carbon AI
  const response = await carbonFilesQueryUserFiles({
    customerId: userId,
    requestParameters: {
      filters: {
        ids: [carbonFileId],
      },
      include_raw_file: true,
    },
  });
  // console.log("response----->", response);
  const userFile = response?.results?.[0];
  if (!userFile) {
    // console.log(`No files found for ${carbonFileId}`);
    throw new RequestError(`No files found for ${carbonFileId}`, 500);
  }
  // console.log("userFile----->", userFile);

  const { presigned_url } = userFile;

  if (!presigned_url) {
    // console.log("presigned_url not found");
    throw new RequestError("presigned_url not found", 500);
  }

  // fetch text data from presigned url
  const presignedURLData = await axios.get(presigned_url);
  const textData = presignedURLData.data;

  if (!textData) {
    // console.log("textData not found");
    throw new RequestError("textData not found", 500);
  }
  // console.log("textData----->", textData);

  // create new entity
  const entityId = uuidv4();
  await createEntityDocument({
    id: entityId,
    value: value,
    sourceType: sourceType,
    subSetType: subSetType,
    isScheduled: false,
    isScraped: true,
    isNoData: false,
  });

  // create carbonScraped document
  await createCarbonScrapedDocument({
    entityId: entityId,
    text: textData,
  });

  // add entityId in userKnowledge
  await findOneAndUpdateUserKnowledge(
    { userId: userId },
    // adds elements to an array only if they are not already present.
    { $addToSet: { entities: entityId } },
    { new: true, upsert: true }
  );

  // increment entityCount in userUsageState
  await findOneAndUpdateUserUsageStatDocument(
    { userId: userId },
    { $inc: { [`entityCount.${sourceType}.${subSetType}`]: 1 } },
    { upsert: true, new: true }
  );

  return sendResponse(res, 200, `success`, response);
}
