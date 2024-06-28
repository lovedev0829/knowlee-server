import {
    CreateOptions,
    Document,
    FilterQuery,
    ProjectionType,
    QueryOptions,
    UpdateQuery,
} from "mongoose";
import UserAgentModel, {
    IUserAgentDocument,
} from "../../models/knowlee-agent/UserAgent.model";
import { entityFindByIdAndUpdate, findEntityDocuments, findOneEntity, updateManyEntities, updateOneEntity } from "../entity.services";
import { getScrapedDataByEntity } from "../scrap.services";
import { findDocRecordDocuments, findOneDocRecord } from "../docRecord.services";
import fsPromises from "fs/promises";
import { openAIFilesCreate } from "../openAI.services";
import { createReadStream } from "fs";
import { findOneAndUpdateUserUsageStatDocument } from "../userUsageStat.services";
import { findUser } from "../user.services";
import { updateManyLocalEntities, updateOneLocalEntity } from "../localEntity.service";

export async function createUserAgentDocument(
    docs: Array<Partial<IUserAgentDocument>>,
    options?: CreateOptions
) {
    return await UserAgentModel.create(docs, options);
}

export async function createOneUserAgentDocument(
    doc: Partial<IUserAgentDocument>,
) {
    return await UserAgentModel.create(doc);
}

export async function findUserAgentDocuments(
    filter: FilterQuery<IUserAgentDocument>,
    projection?: ProjectionType<IUserAgentDocument>,
    options?: QueryOptions<IUserAgentDocument>
) {
    return await UserAgentModel.find(filter, projection, options);
}

export async function findOneUserAgentDocument(
    filter: FilterQuery<IUserAgentDocument>,
    projection?: ProjectionType<IUserAgentDocument>,
    options?: QueryOptions<IUserAgentDocument>
) {
    return await UserAgentModel.findOne(filter, projection, options);
}

export const findOneAndUpdateUserAgent = async (
    filter?: FilterQuery<IUserAgentDocument>,
    update?: UpdateQuery<IUserAgentDocument>,
    options?: QueryOptions<IUserAgentDocument>
) => {
    return await UserAgentModel.findOneAndUpdate(filter, update, options);
};

// the hook also deletes the assistant & its files from openAI
export const deleteManyUserAgent = async (
    filter?: FilterQuery<IUserAgentDocument>,
    options?: QueryOptions<IUserAgentDocument>
) => {
    return await UserAgentModel.deleteMany(filter, options);
};

export async function getOpenAIFileIdsFromEntityIds(entityIds: string[]) {
    const entities = await findEntityDocuments({ id: { $in: entityIds } });

    const entityScrapedDataList: Document[] = [];

    for (const entity of entities) {
        const entityData = await getScrapedDataByEntity(entity);
        if (!entityData) {
            console.error(`Error: No scraped data found for entityId - ${entity.id}`);
            continue;
        }
        entityScrapedDataList.push(entityData);
    }

    // if entity is local entity
    const docRecords = await findDocRecordDocuments({
        entityId: { $in: entityIds },
    });

    entityScrapedDataList.push(...docRecords);

    const file_ids = [];

    // create file locally from scraped data
    for (const data of entityScrapedDataList) {
        await fsPromises.writeFile(`${data.id}`, JSON.stringify(data));
        //console.log(`Created file for data ${data.id}`);

        // create openAi file from createdFile
        const file = await openAIFilesCreate({
            file: createReadStream(data.id),
        });
        //console.log("openAI file ----->", file);

        file_ids.push(file.id);
        // delete temp files
        await fsPromises.unlink(data.id);
    }
    return file_ids;
}

export async function getOpenAIFileIdsFromEntityId(entityId: string) {
  // find entity from DB
  const dbEntity = await findOneEntity({ id: entityId });
  let entityScrapedDataDoc: Document;

  if (dbEntity) {
    // get entity scrape data from respective collection
    const entityData = await getScrapedDataByEntity(dbEntity);

    if (!entityData) {
      throw new Error(
        `Error: No scraped data found for entityId - ${dbEntity.id}`
      );
    }
    entityScrapedDataDoc = entityData;
    const fileId = await createFileIdFromEntityScrapedDoc(entityScrapedDataDoc);
    await updateManyEntities({ id: entityId }, { $set: { fileId: fileId } });
    return fileId;
  } else {
    // if entity is local entity
    const docRecord = await findOneDocRecord({
      entityId: entityId,
    });

    if (!docRecord) throw new Error(`Could not locate entity ${entityId}`);
    entityScrapedDataDoc = docRecord;
    const fileId = await createFileIdFromEntityScrapedDoc(entityScrapedDataDoc);
    await updateManyLocalEntities(
      { id: entityId },
      { $set: { fileId: fileId } }
    );
    return fileId;
  }
}

type IScrapedData = Document & { entityId: string };

export async function saveOpenAIFileIdIntoEntity(scrapedData: IScrapedData[]) {
  // Create openAI fileId and save it in entity
  for (const scrapedEntityData of scrapedData) {
    if (!scrapedEntityData.entityId) {
      console.error(
        "Could not find the entity while creating fileId for openAI"
      );
      continue;
    }
    const fileId = await createFileIdFromEntityScrapedDoc(scrapedEntityData);

    const updatedEntity = await updateOneEntity(
      { id: scrapedEntityData.entityId },
      { $set: { fileId: fileId } }
    );

    if (!updatedEntity.matchedCount) {
      const updatedLocalEntity = await updateOneLocalEntity(
        { id: scrapedEntityData.entityId },
        { $set: { fileId: fileId } }
      );
    }
  }
}

const createFileIdFromEntityScrapedDoc = async (
  entityScrapedDataDoc: Document
) => {
  const fileNameWithExtension = `${entityScrapedDataDoc.id}.txt`;
  await fsPromises.writeFile(
    fileNameWithExtension,
    JSON.stringify(entityScrapedDataDoc)
  );
  //console.log(`Created file for data ${fileNameWithExtension}`);
  //console.log(`Created file for ${JSON.stringify(entityScrapedDataDoc)}`);

  // create openAi file from createdFile
  const file = await openAIFilesCreate({
    file: createReadStream(fileNameWithExtension),
  });
  //console.log("openAI file ----->", file);

  // delete temp files
  await fsPromises.unlink(fileNameWithExtension);
  return file.id;
};

export const countUserAgent = async (
    filter?: FilterQuery<IUserAgentDocument>,
) => {
    return await UserAgentModel.count(filter);
};

export async function recalculateUserUsageAgentCount() {
    // get all users
    const userList = await findUser({});

    // for each user
    for (const user of userList) {
        const { id: userId } = user;
        const userAgentCount = await countUserAgent({ creatorId: userId });

        //console.log("userAgentCount----->", userId, userAgentCount);
        await findOneAndUpdateUserUsageStatDocument(
            { userId: userId },
            {
                $set: {
                    userAgentCount: userAgentCount,
                },
            },
            { upsert: true, new: true }
        );
    }
    //console.log("DONE: recalculated User Usage for userAgentCount");
}