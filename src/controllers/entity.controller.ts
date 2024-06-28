import { Request, Response } from "express";
import { ClientSession, UpdateQuery } from "mongoose";
import { EntityModel } from "../models/entity.model";
import { UserKnowledgeModel } from "../models/userKnowledge.model";
import {
  createEntities,
  createEntityDocument,
  doesEntityValueExistInUserKnowledge,
  doubleStepCombinations,
  entityFindByIdAndUpdate,
  findEntitiesWithUserVectors,
  findEntityDocuments,
  findOneEntity,
  updateManyEntities,
  updateOneEntity,
} from "../services/entity.services";
import { createNewUserKnowledge, getUser } from "../services/user.services";
import { RequestError } from "../utils/globalErrorHandler";
import { sendResponse } from "../utils/response.utils";
import { v4 as uuidv4 } from "uuid";
import { LocalEntityModel } from "../models/localEntity.model";
import csv from "csvtojson";
import { PROCESS_MULTIPLE_ENTITIES, agenda } from "../lib/agenda.services";
import { IProcessMultipleEntities } from "../types/agenda";
import { findOneUserVector } from "../services/userVector.services";
import { getGithubScrapedDataByEntityWithPagination, getScrapedDataByEntity } from "../services/scrap.services";
import { findDocRecordDocuments, findOneDocRecord } from "../services/docRecord.services";
import { POSSIBLE_SOURCE_TYPES_AND_THEIR_SUBTYPES } from "../utils/constants";
import { findOneAndUpdateUserUsageStatDocument } from "../services/userUsageStat.services";
import { findOneAndUpdateUserAgent, findUserAgentDocuments } from "../services/knowlee-agent/agent.services";
import {
  openAIVectorStoresDel,
  openAIVectorStoresFileBatchesCreate,
  openAIVectorStoresFilesList,
} from "../services/openAI.services";
import { isDoubleStepApifyProcess } from "../services/apify.services";
import { findOneAndUpdateUserKnowledge, findOneUserKnowledge, findUserKnowledge } from "../services/userKnowledge.services";
import { GoogleDrivePickerDocument } from "../types/google.type";
import { createGoogleDriveScrapedDocument } from "../services/googleDriveScraped.service";
import {
  downloadContentsOfOneDriveItem,
  microsoftRefreshAccessToken,
} from "../lib/microsoft/microsoft.services";
import {
  KEYS_TO_ENCRYPT,
  findOneAndUpdateThirdPartyConfig,
  findOneThirdPartyConfig,
} from "../services/thirdPartyConfig.services";
import { createOneDriveScrapedDocuments } from "../services/oneDriveScraped.service";
import { processFileContent } from "../services/documentChat.services";
import { encode } from "gpt-3-encoder";
import { encryptData } from "../utils/encryption";
import { ThirdPartyConfig } from "../models/third-party/ThirdPartyConfig.model";

const MICROSOFT_ONEDRIVE_ENTITY_TITLE_LENGTH = 120;

// TODO: check the sourceType correspondance
// check if is a valid url that can be scheduled for scraping
// check if is a valid url that corresponds to the correct sourceType (can't have a youtube link inside a twitter entity)

// Loop through entities and check
// TODO: still need to check if the urls are vali


// TODO: secure the calls can only be made by the user owner of the entities

export const addEntities = async (req: Request, res: Response) => {
  const session: ClientSession = req.session!;

  const { userId } = req.params;
  if (!userId) throw new RequestError('User ID is required', 400);

  const entities = req.body;
  // Check if entities is an array and it has items
  if (!Array.isArray(entities) || entities.length === 0)
    throw new RequestError('The entity list is empty. Please add entities to proceed.', 400);

    function delay(seconds: number) {
      return new Promise(resolve => {
        setTimeout(resolve, seconds * 1000); // Convert seconds to milliseconds
      });
    }

    // Adding a delay of 3 seconds before calling getUser
    await delay(3);
    const user = await getUser(userId, session);
    if (!user) throw new RequestError('User does not exist', 404);


    const entitiesIdsToAdd = [];
    const newEntities = [];
    const incObject: { [key: string]: number } = {};
    let alreadyAddedEntitiesCount = 0;

    for (const entity of entities) {
      const { sourceType, subSetType, value, isScraped } = entity;

      // values for sourceType should all be lowercase
      entity.sourceType = sourceType.toLowerCase();

      if (!sourceType || !value || !subSetType) throw new RequestError('Missing required fields in one or more entities', 400)

      // Check if the entity already exists in the userKnowledge
      const hasBeenAddedAlready = await doesEntityValueExistInUserKnowledge(
        userId,
        value,
        session
      );

      if (hasBeenAddedAlready)  {
        alreadyAddedEntitiesCount += 1
        continue;
      }
      // throw new RequestError(`Entity with value "${value}" has already been added`, 400)

      // Now we check if it's been already inserted by someone already
      const existingEntity = await EntityModel.findOne({ value }, {}, { session: session });
      // Can there be entities of different source with the same value?
      // We assume no for now

      // If it's already been added by someone, we just add the id and move on to next entity
      if (existingEntity) {
        entitiesIdsToAdd.push(existingEntity.id);
        incObject[`entityCount.${sourceType}.${subSetType}`] =
          (incObject[`entityCount.${sourceType}.${subSetType}`] || 0) + 1;
        continue;
      }

      // adding a new unique id server side to avoid duplicates from client
      const newEntity = new EntityModel({
        ...entity,
        id: uuidv4(),
        isScraped: isScraped || false,
        isScheduled: isDoubleStepApifyProcess({ sourceType, subSetType }),
      });

      newEntities.push(newEntity);
      entitiesIdsToAdd.push(newEntity.id);
      incObject[`entityCount.${sourceType}.${subSetType}`] =
        (incObject[`entityCount.${sourceType}.${subSetType}`] || 0) + 1;
    }

    //console.log("new entities----->", newEntities);
    //console.log("new entity id----->", entitiesIdsToAdd);

    if(alreadyAddedEntitiesCount && alreadyAddedEntitiesCount === entities.length) {
      throw new RequestError(`All entities you're trying to add have already been added. Please check your list for new entities to add.`, 400)
    }

    const userKnowledge = await UserKnowledgeModel.findOneAndUpdate(
      { userId: userId },
      { $push: { entities: { $each: entitiesIdsToAdd } } },
      { new: true, session: session, upsert: true },
    );

    // If entity was not used by anyone, (scheduled false), we toggle it on
    // so it runs in agenda
    // entities with isSchedule != false will run 
    await updateOneEntity({
      isScheduled: false,
      id: { $in: entitiesIdsToAdd }
    }, {
      $set: {
        isScheduled: true
      }
    })

    // Insert all new entities at once
    await EntityModel.insertMany(newEntities, { session: session });

    // increment entityCount
    const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
      { userId: userId },
      { $inc: incObject },
      { upsert: true, new: true }
    );

    // process entities, scrap data and create userVectors
    await agenda.now<IProcessMultipleEntities>(PROCESS_MULTIPLE_ENTITIES, {
      entities: newEntities,
      userIdList: [userId],
    });

    if(alreadyAddedEntitiesCount && alreadyAddedEntitiesCount < entities.length) {
      let message = `Note: ${alreadyAddedEntitiesCount} of the entities you tried to add were already in the system and have been skipped.`
      return sendResponse(res, 409, message, userKnowledge);
    }

    return sendResponse(res, 200, "", userKnowledge);
}


export const removeEntity = async (req: Request, res: Response) => {
  const session: ClientSession = req.session!;

  const { userId, entityId } = req.params;
  if (!userId || !entityId) throw new RequestError('Missing params userId or entityId', 400);

  try {
    const user = await getUser(userId, session);
    if (!user) throw new RequestError('User does not exist', 404);

    //Check if the entity already exists in the userKnowledge
    const userKnowledge = await UserKnowledgeModel.findOne({ userId }, {}, { session: session });
    if (!userKnowledge) throw new RequestError('UserKnowledge does not exist', 404);

    const { entities } = userKnowledge;
    // Check if the enityId is present inside the entitite
    const entityExists = entities.some((e) => e.toString() === entityId);
    if (!entityExists) throw new RequestError('Entity does not exist', 404);

    // Remove the entity from the userKnowledge
    const updatedUserKnowledge = await UserKnowledgeModel.findOneAndUpdate(
      { userId: userId },
      { $pull: { entities: entityId } },
      { new: true, session: session },
    )
    const entity = await findOneEntity({ id: entityId });
    if (entity) {
      const { sourceType, subSetType, id, _id: dbEntityId } = entity;

      const isDoubleStep = isDoubleStepApifyProcess({
        sourceType, subSetType
      })

      // isSchedule turned false if no one else is using double step entity
      if(isDoubleStep) {
        const isUseful = await findOneUserKnowledge({ entities: { $in: [id] }, userId: { $ne: user.id } })
        if(!isUseful) {
          await entityFindByIdAndUpdate(dbEntityId, {
            $set: {
              isScheduled: false
            }
          })
          
          const childEntities = await findEntityDocuments({ originId: entityId })
                    
          for (const childEntity of childEntities) {
            // deleting user vectors and pinecone data with deleteOne method
            const userVector = await findOneUserVector({ userId: userId, entityId: childEntity.id });
            if (userVector) {
              await userVector.deleteOne();
            }
          }

          // deleting child entities ( daily scraped entities )
          // await deleteManyEntities({ originId: entityId })
        }
      }

      if (entity.fileId) {
        // find agents with entity attached
        const agents = await findUserAgentDocuments({
          entityIds: entityId,
          creatorId: userId,
        });

        // detach removed entities fileId from all the agents
        for (const agent of agents) {
          // remove entity id from entityids list in user agent
          await findOneAndUpdateUserAgent(
            { _id: agent.id },
            {
              $pull: { entityIds: entityId },
            }
          );

          const vectorStoreId =
            agent.assistant?.tool_resources?.file_search?.vector_store_ids?.[0];
          if (!vectorStoreId) {
            // skip if vectorStoreId is not present
            continue;
          }

          // retreive files attached to vector store
          const vectorStoreFileList = await openAIVectorStoresFilesList(
            vectorStoreId
          );

          const filteredVectorStoreFileList = vectorStoreFileList.data.filter(
            (vsFile) => vsFile.id !== entity.fileId
          );

          const file_ids = filteredVectorStoreFileList.map(
            (vsFile) => vsFile.id
          );

          if (file_ids.length) {
            // remove fileIds from vector store
            // no need to update assistant as files from vector store will be removed
            await openAIVectorStoresFileBatchesCreate(vectorStoreId, {
              file_ids: file_ids,
            });
          } else {
            // delete vector store
            await openAIVectorStoresDel(vectorStoreId);
          }
        }
      }

      // decrement entityCount
      const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
        { userId: userId },
        { $inc: { [`entityCount.${sourceType}.${subSetType}`]: -1 } },
        { upsert: true, new: true }
      );
    }

    // remove if it is local entity
    const localEntity = await LocalEntityModel.findOneAndDelete({ id: entityId });

    await findDocRecordDocuments({ entityId: entityId });
    if (localEntity) {
      // decrement localEntityCount
      const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
        { userId: userId },
        { $inc: { "localEntityCount": -1 } },
        { upsert: true, new: true }
      );
    }

    // find userVector
    const userVector = await findOneUserVector({ userId: userId, entityId: entityId });
    if (userVector) {
      await userVector.deleteOne();
    }

    return res.status(200).json(updatedUserKnowledge);

  } catch (error) {
    throw new RequestError(`Something went wrong when removing entity: ${error}`, 500)
  }
};


export const getAllUserEntities = async (req: Request, res: Response) => {
  const session: ClientSession = req.session!;
  const { userId } = req.params;
  if (!userId) throw new RequestError('userId is required', 400);

  const queryObject = req.query

  interface IFilter {
    [key: string]: string | boolean | any;
  }
 
  interface ISorting {
    [fieldName: string]: 1 | -1;
  }
  
  const filter: IFilter = {}
  let userVectorConditions = {}
  const sort: ISorting = {}
  if(queryObject.sourceType) {
    filter.sourceType = queryObject.sourceType
  }
  
  if(queryObject.subSetType) {
    filter.subSetType = queryObject.subSetType
  }
  
  if(queryObject.status) {
    if(queryObject.status === "multi-step") {
      filter.$or = doubleStepCombinations      
    }

    if(queryObject.status === "learned") {
      // temporary pinecone paused
      filter.isScraped = true //added temp
      userVectorConditions = {
        "userVectors.0": { $exists: false } // Checks if the userVectors array does not exist element
        //"userVectors.0": { $exists: true } // Checks if the userVectors array has at least one element
      }
    }
    // 
    if(queryObject.status === "in-progress") {
      filter.$nor = doubleStepCombinations
      filter.isScraped = false
      userVectorConditions = {
        $expr: { $eq: [{ $size: "$userVectors" }, 0] } // Matches records with userVectors array length = 0
      } 
    }
    
    if(queryObject.status === "no-data") {
      filter.$nor = doubleStepCombinations
      filter.isNoData = true
      // userVectorConditions = {
      //   $expr: { $eq: [{ $size: "$userVectors" }, 0] } // Matches records with userVectors array length = 0
      // }
    }
    
    if(queryObject.status === "data-found") {
      filter.$nor = doubleStepCombinations
      filter.isScraped = true
      userVectorConditions = {
        "userVectors.0": { $exists: true } // Checks if the userVectors array has at least one element
      }
    }
  }
  
  // lastAdded
  if(queryObject.startDate && queryObject.endDate) {
    const startDate = new Date(queryObject.startDate as string);
    const endDate = new Date(queryObject.endDate as string);
    filter.createdAt = { $gte: startDate, $lte: endDate }
  }
  

  let allowNoData = false  
  if (queryObject.allowNoData) {
    allowNoData = queryObject.allowNoData === "true" ? true : false
    if (!allowNoData) {
      filter.isNoData = {
        $ne: true
      }
    }
  }


let sortCriteria: ISorting = {};
if (queryObject.sortBy) {
  sortCriteria[queryObject.sortBy as string] = queryObject.sortOrder === 'desc' ? -1 : 1;
} else {
  sortCriteria["createdAt"] = -1
}

  const userKnowledge = await UserKnowledgeModel.findOne({ userId }, {}, { session: session });
  if (!userKnowledge) {
    await createNewUserKnowledge(userId, session);
    return sendResponse(res, 200, "", []);
  }

  // This is an array of entity ids
  const { entities } = userKnowledge;

  const entityWithUserVectorsPipeline = [
    {
      $match: {
        id: { $in: entities },
        originId: { $exists: false },
        ...filter
      },
    },
    {
      $lookup: {
        from: "uservectors",
        localField: "id",
        foreignField: "entityId",
        as: "userVectors",
        pipeline: [
          {
            $match: {
              userId: userId,
            },
          },
        ],
      },
    },
    {
      $match: userVectorConditions,
    },
    {
      $sort: sortCriteria
    }
  ];
  
  let allowUploadedFiles = false;
  if (queryObject.allowUploadedFiles) {
    allowUploadedFiles = queryObject.allowUploadedFiles === "true";
    if (allowUploadedFiles) {
      const alllocalEntities = await LocalEntityModel.aggregate(
        [
          ...entityWithUserVectorsPipeline,
          {
            $addFields: {
              isLocal: true,
            },
          },
        ],
      )
      return sendResponse(res, 200, "", alllocalEntities);
    }
  }


  // Get all the entities from the database
  const allUserEntities = await EntityModel.aggregate(
    [
      ...entityWithUserVectorsPipeline,
      {
        $addFields: {
          isLocal: false,
        },
      },
    ],
  )
    .unionWith({
      coll: "localentities",
      pipeline: [
        ...entityWithUserVectorsPipeline,
        {
          $addFields: {
            isLocal: true,
          },
        },
      ],
    })
    .sort({ createdAt: -1 });
    ////console.log("\nallUserEntities LENGTH", allUserEntities.length)
  return sendResponse(res, 200, "", allUserEntities);
};

export const getAllScrapedUserEntities = async (req: Request, res: Response) => {
  const session: ClientSession = req.session!;
  const { userId } = req.params;
  if (!userId) throw new RequestError('userId is required', 400);

  // Standard queryObject initialization
  const { skip = 0, limit = 50, excludeNoData = false } = req.query;

  // Initialize filter object with isScraped = true
  const filter: { isScraped: boolean; isNoData?: { $ne?: boolean } } = { isScraped: true };
  if (excludeNoData) {
    filter.isNoData = { $ne: true };
  }


  // Include additional filters from queryObject if needed
  // ...

  // Get userKnowledge document for the user
  const userKnowledge = await UserKnowledgeModel.findOne({ userId }, {}, { session: session });
  if (!userKnowledge) {
    await createNewUserKnowledge(userId, session);
    return sendResponse(res, 200, "", []);
  }

  // Extract entity IDs from userKnowledge
  const { entities } = userKnowledge;

  // Aggregation pipeline to fetch scraped entities
  const scrapedEntitiesPipeline = [
    {
      $match: {
        $or: [
          { id: { $in: entities } },
          { originId: { $in: entities } },
        ],
        ...filter
      },
    },
    // Additional pipeline stages if needed (e.g., sorting)
    // ...
  ];

  // Execute the aggregation pipeline
  const allUserEntities = await EntityModel.aggregate([
    ...scrapedEntitiesPipeline,
    {
      $addFields: {
        isLocal: false,
      },
    },
  ])
    .unionWith({
      coll: "localentities",
      pipeline: [
        ...scrapedEntitiesPipeline,
        {
          $addFields: {
            isLocal: true,
          },
        },
      ],
    })
    .sort({ createdAt: -1 })
    .skip(Number(skip))
    .limit(Number(limit));

  const totalCountRes = await EntityModel.aggregate(scrapedEntitiesPipeline)
    .unionWith({
      coll: "localentities",
      pipeline: scrapedEntitiesPipeline,
    })
    .count("totalCount");

  const totalCount = totalCountRes?.[0]?.totalCount || 0;

  // Send the response back
  return sendResponse(res, 200, "", {
    entityList: allUserEntities,
    totalCount,
  });
};


export const processBulkUplaodEntities = async (req: Request, res: Response) => {
  const session: ClientSession = req.session!;

  const userId = req.user?.id;
  if (!userId) throw new RequestError('User ID is required', 400);

  if (!req.file) throw new RequestError('File is required', 400);

  try {
    const entities = await csv().fromString(req.file.buffer.toString("utf-8"));
    //console.log("entities----->", entities);

    const entitiesIdsToAdd = [];
    const newEntities = [];
    let skippedRowCounter = 0;
    const incObject: { [key: string]: number } = {};

    // Check if entities is an array and it has items
    if (!Array.isArray(entities) || entities.length === 0)
      throw new RequestError('The entity list is empty. Please add entities to proceed.', 400);

    for (const entity of entities) {
      const { Source: source, URL: url, Type: type } = entity;

      // if (!sourceType || !value || !subSetType) throw new RequestError('Missing required fields in one or more entities', 400);
      if (!source || !url || !type) {
        skippedRowCounter += 1;
        continue;
      };

      // values should all be lowercase
      const sourceType: string = source.toLowerCase().trim();
      const value = url.toLowerCase();
      const subSetType: string = type.toLowerCase().trim();

      const possibleSubtypes = POSSIBLE_SOURCE_TYPES_AND_THEIR_SUBTYPES[sourceType]

      // Validating 'sourceType' 'subSetType'
      if (!possibleSubtypes) {
        console.error(`${sourceType} is not valid listed sourceType, skipping the record`);
        skippedRowCounter += 1;
        continue;
      }

      if (!possibleSubtypes.includes(subSetType)) {
        console.error(`${subSetType} is not valid listed subSetType, skipping the record`);
        skippedRowCounter += 1;
        continue;
      }

      // Check if the entity already exists in the userKnowledge
      const hasBeenAddedAlready = await doesEntityValueExistInUserKnowledge(
        userId,
        value,
        session
      );

      // if (hasBeenAddedAlready) throw new RequestError(`Entity with value "${value}" has already been added`, 400);
      if (hasBeenAddedAlready) {
        skippedRowCounter += 1;
        continue
      };

      // Now we check if it's been already inserted by someone
      const existingEntity = await EntityModel.findOne({ value }, {}, { session: session });
      // Can there be entities of different source with the same value?
      // We assume no for now

      // If it's already been added by someone, we just add the id and move on to next entity
      if (existingEntity) {
        entitiesIdsToAdd.push(existingEntity.id);
        skippedRowCounter += 1;
        incObject[`entityCount.${sourceType}.${subSetType}`] =
          (incObject[`entityCount.${sourceType}.${subSetType}`] || 0) + 1;
        continue;
      }

      const newEntity = new EntityModel({
        sourceType,
        subSetType,
        value,
        id: uuidv4(),
        isScraped: false,
      });

      newEntities.push(newEntity);
      entitiesIdsToAdd.push(newEntity.id);
      incObject[`entityCount.${sourceType}.${subSetType}`] =
        (incObject[`entityCount.${sourceType}.${subSetType}`] || 0) + 1;
    }

    //console.log("new entities----->", newEntities);
    //console.log("new entity id----->", entitiesIdsToAdd);
    console.warn("Skipped rows----->", skippedRowCounter);

    const userKnowledge = await UserKnowledgeModel.findOneAndUpdate(
      { userId: userId },
      { $push: { entities: { $each: entitiesIdsToAdd } } },
      { new: true, session: session, upsert: true },
    );

    // Insert all new entities at once
    await EntityModel.insertMany(newEntities, { session: session });

    // increment entityCount
    const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
      { userId: userId },
      { $inc: incObject },
      { upsert: true, new: true }
    );

    // process entities, scrap data and create userVectors
    await agenda.now<IProcessMultipleEntities>(PROCESS_MULTIPLE_ENTITIES, {
      entities: newEntities,
      userIdList: [userId],
    });

    return sendResponse(res, 200, "", userKnowledge);
  } catch (error) {
    throw new RequestError(`Something went wrong when adding entities: ${error}`, 500)
  }
};

export const getEntityScrapedDataController = async (req: Request, res: Response) => {
  const { entityId } = req.params;
  const pagination = { limit: Number(req.query.limit) || 10, skip: Number(req.query.skip) || 0 }

  if (!entityId) throw new RequestError('entityId is required', 400);

  const entity = await findOneEntity({ id: entityId });
  if (entity) {
    const { sourceType, subSetType, value, id: entityId } = entity;
    if(sourceType === "github" && subSetType === "url")  {
      const githubResponse = await getGithubScrapedDataByEntityWithPagination(entity, pagination)
      return sendResponse(res, 200, "success", githubResponse); 
    }
    const data = await getScrapedDataByEntity(entity, pagination);
    if (data) {
      return sendResponse(res, 200, "success", data);
    }else{
      await updateManyEntities(
        { id: { $in: [entityId] } },
        { isScraped: true, isNoData: true  }
    );
    }
  }

  const docRecord = await findOneDocRecord({ entityId: entityId });
  if (docRecord) {
    return sendResponse(res, 200, "success", docRecord)
  }
  return sendResponse(res, 404, "No scraped data found");
};

export const getAllEntitiesController = async (req: Request, res: Response) => {
  const filter = req.query;

  const data = await findEntitiesWithUserVectors(filter)
    
  return sendResponse(res, 200, "", data);
};

export const findEntitiesController = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;

  const filter = req.query;

  const userKnowledge = await findOneUserKnowledge({ userId });
  if (!userKnowledge) {
    await createNewUserKnowledge(userId);
    return sendResponse(res, 200, "success", []);
  }

  // This is an array of entity ids
  const { entities } = userKnowledge;

  // Get all the entities from the database
  const filteredEntities = await EntityModel.aggregate([
    {
      $match: {
        id: { $in: entities },
        // originId: { $exists: false },
        ...filter,
      },
    },
  ]).sort({ createdAt: -1 });
  return sendResponse(res, 200, "success", filteredEntities);
};

export async function handleGoogleDriveTextController(
  req: Request,
  res: Response
) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;

  const body = req.body as { doc: GoogleDrivePickerDocument; text: string };
  // console.log("req.body----->", JSON.stringify(body));
  const { doc, text = "" } = body;
  const { mimeType = "", url = "", name = "" } = doc;
  const sourceType = "google_drive";
  const subSetType = mimeType.split('.').pop();
  const value = url;

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

  // create Google Drive Scraped document
  await createGoogleDriveScrapedDocument({
    entityId: entityId,
    text: text,
    title: name,
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

  return sendResponse(res, 200, `success`);
}

export async function handleOneDriveFileController(
  req: Request,
  res: Response
) {
  const session: ClientSession = req.session!;
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;

  const { itemId } = req.body;
  if (!itemId) throw new RequestError("itemId is required", 400);

  const thirdPartyConfig = await findOneThirdPartyConfig({ userId: userId });
  if (!thirdPartyConfig) {
    throw new RequestError("Not Authorized: No third party config found");
  }
  const microsoftToken = thirdPartyConfig?.microsoft?.token;
  if (!microsoftToken) {
    throw new RequestError("Not Authorized: No microsoft token found");
  }

  // request new access token every time to make sure token is valid
  const token = await microsoftRefreshAccessToken({
    refreshToken: microsoftToken.refresh_token,
  });

  const updateObject: UpdateQuery<ThirdPartyConfig> = {};
  
  for (const key in token) {
    let value = token[key as keyof typeof token];
    if (KEYS_TO_ENCRYPT.includes(key) && typeof value === "string") {
      value = encryptData(value);
    }
    updateObject[`microsoft.token.${key}`] = value;
  }

  // update token in thirdparty config
  await findOneAndUpdateThirdPartyConfig(
    { userId: userId },
    updateObject,
    {
      upsert: true,
      new: true,
      session: session,
    }
  );

  // Download the contents of a DriveItem
  const { data, headers } = await downloadContentsOfOneDriveItem({
    itemId,
    accessToken: token?.access_token,
  });

  const contentType = headers?.["content-type"];
  // console.log("content-type----->", headers);
  // console.log("content-type----->", headers?.get("content-type"));
  // console.log("content-location----->", headers?.get("content-location"));

  const newDocs = await processFileContent(contentType, Buffer.from(data));
  const text = newDocs?.map((item) => item.pageContent).join(" ");
  // console.log(
  //   "text.substring()----->",
  //   text?.substring(0, MICROSOFT_ONEDRIVE_ENTITY_TITLE_LENGTH)
  // );
  // count token and save it to entity
  const tokens = encode(text).length;

  const sourceType = "microsoft_onedrive";
  // get last word after the . to avoid nested object
  const subSetType = contentType?.split('.').pop();
  // the first 120 characters coming from the content, if no content is found, concatenate the ID with "OneDrive_"
  const value = text
    ? text.substring(0, MICROSOFT_ONEDRIVE_ENTITY_TITLE_LENGTH)
    : `OneDrive_${itemId}`;

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
        { new: true, upsert: true, session: session }
      );
      // increment entityCount in userUsageStat
      await findOneAndUpdateUserUsageStatDocument(
        { userId: userId },
        { $inc: { [`entityCount.${sourceType}.${subSetType}`]: 1 } },
        { upsert: true, new: true, session: session }
      );
      // return success response
      return sendResponse(res, 200, `success`);
    }
  }

  // create new entity
  const entityId = uuidv4();
  await createEntities(
    [
      {
        id: entityId,
        value: value,
        sourceType: sourceType,
        subSetType: subSetType,
        isScheduled: false,
        isScraped: true,
        isNoData: false,
        tokens: tokens,
      },
    ],
    { session: session }
  );

  // create OneDrive Scraped document
  await createOneDriveScrapedDocuments(
    [
      {
        contentType,
        entityId,
        text,
        itemId,
      },
    ],
    { session: session }
  );

  // add entityId in userKnowledge
  await findOneAndUpdateUserKnowledge(
    { userId: userId },
    // adds elements to an array only if they are not already present.
    { $addToSet: { entities: entityId } },
    { new: true, upsert: true, session: session }
  );

  // increment entityCount in userUsageState
  await findOneAndUpdateUserUsageStatDocument(
    { userId: userId },
    { $inc: { [`entityCount.${sourceType}.${subSetType}`]: 1 } },
    { upsert: true, new: true, session: session }
  );

  return sendResponse(res, 200, `success`);
}
