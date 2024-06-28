import { ClientSession, FilterQuery, ProjectionType, QueryOptions, UpdateQuery } from "mongoose";
import { EntityModel, IEntity } from "../models/entity.model";
import { UserKnowledgeModel } from "../models/userKnowledge.model";
import {
  APIFY_ACTOR_ID,
  fetchActorResults,
  generateInputForApifyActor,
  getTextContent,
  getEntitiesFromScrapedData,
  isDoubleStepApifyProcess,
  startApifyActor,
  googleNewsApifyActorId,
  GoogleNewsData,
  ActorResponse,
} from "./apify.services";
import { saveScrapedDataToMongoDB } from "./scrap.services";
import { getUserKnowledgeByEntityId, userKnowledgeAddEntities } from "./userKnowledge.services";
import { createUserVector, findOneUserVector } from "./userVector.services";
import { RUN_APIFY_ACTOR_AND_GET_DATA_AGENDA, agenda } from "../lib/agenda.services";
import { IRunApifyActorAgenda } from "../types/agenda";
import { createAndUpsertPineconeVectorViaApify } from "./pinecone.services";
import { findOneAndUpdateUserUsageStatDocument } from "./userUsageStat.services";
import { RedditComment, RedditPost } from "../models/scrap/Reddit.model";
import { gitbookPost, githubRepo, saveDataToMongoDB } from "../lib/GitbookLoader.service";
import { getBubblemapsScrapedDataRequest } from "../lib/bubblemaps.service";
import { CreateOptions } from "mongoose";


// export const doubleStepCombinations = [
//   { sourceType: 'youtube', subSetType: 'account' },
//   { sourceType: 'twitter', subSetType: 'hashtag' },
//   { sourceType: 'twitter', subSetType: 'profile' },
//   { sourceType: 'medium', subSetType: 'account' },
//   { sourceType: 'news', subSetType: 'keyword' },
// ];

export const doubleStepCombinations = [
  {
    sourceType: { $regex: 'youtube', $options: 'i' },
    subSetType: { $regex: 'account', $options: 'i' },
  },
  {
    sourceType: { $regex: 'twitter', $options: 'i' },
    subSetType: { $regex: '(hashtag|profile)', $options: 'i' },
  },
  {
    sourceType: { $regex: 'medium', $options: 'i' },
    subSetType: { $regex: 'account', $options: 'i' },
  },
  {
    sourceType: { $regex: 'news', $options: 'i' },
    subSetType: { $regex: 'keyword', $options: 'i' },
  },
];

export const doesEntityValueExistInUserKnowledge = async (
  userId: string,
  value: string,
  session: ClientSession
) => {
  // first we get the userKnowledge
  const userKnowledge = await UserKnowledgeModel.findOne(
    { userId },
    {},
    { session: session }
  );

  // handle the case where the userKnowledge does not exist
  if (!userKnowledge) return false;

  const { entities } = userKnowledge;
  // entities is an array of Ids

  // get the entities from the database using the array of Ids
  const allUserEntities = await EntityModel.find(
    {
      id: { $in: entities },
    },
    null,
    { session: session }
  );
  // check for each entity if the value matches
  const entityExists = allUserEntities.some((e) => e.value === value);
  return entityExists;
};

export const entityFindByIdAndUpdate = async (
  id: string,
  update: UpdateQuery<IEntity>
) => {
  return await EntityModel.findByIdAndUpdate(id, update);
};


export const updateManyEntities = async (
  filter: FilterQuery<IEntity>,
  update: UpdateQuery<IEntity>
) => {
  return await EntityModel.updateMany(filter, update);
};

export const deleteManyEntities = async (
  filter: FilterQuery<IEntity>,
  options?: QueryOptions<IEntity> 
) => {
  return await EntityModel.deleteMany(filter, options);
};

export const updateOneEntity = async (
  filter: FilterQuery<IEntity>,
  update: UpdateQuery<IEntity>,
  options?: QueryOptions<IEntity> 
) => {
  return await EntityModel.updateOne(filter, update, options);
};


export async function getAllDoubleStepEntity() {
  return await EntityModel.aggregate<IEntity>([
      {
        $match: {
          $or: doubleStepCombinations,
        },
      },
  ]);
}

export async function getAllDoubleStepScheduledEntities() {
  return await EntityModel.aggregate<IEntity>([
      {
        $match: {
          // `isScheduled` flag was added later, some active entities might
          // not have this true
          isScheduled: { $ne: false },
          $or: doubleStepCombinations,
        },
      },
  ]);
}

export async function getAllDoubleStepEntityCount(userId: string) {  
  let userKnowledge = await UserKnowledgeModel.findOne({ userId }, {});
  if (!userKnowledge) {
   userKnowledge = new UserKnowledgeModel({
      userId,
      entities: [],
    });
  }

  // This is an array of entity ids
  const { entities } = userKnowledge;

  const entityWithUserVectorsPipeline = [
    {
      $match: {
        id: { $in: entities },
        originId: { $exists: false },
        $or: doubleStepCombinations
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
      $group: {
        _id: null,
        count: { $sum: 1 },
        // entities: { $push: "$$ROOT" }, 
        // To get entities doc
      },
    },
    {
      $project: {
        _id: 0,
        count: 1, 
      },
    }
  ];

  const doubleStepEntites = await EntityModel.aggregate(
    entityWithUserVectorsPipeline
  )
  const count = doubleStepEntites.length > 0 ? doubleStepEntites[0].count : 0;
  return count
}

export async function findOneEntity(filter?: FilterQuery<IEntity>) {
  return EntityModel.findOne(filter);
}

export async function insertManyEntities(data: unknown[]) {
  const newEntities = data.map((entity) => {
    return new EntityModel(entity);
  });

  await EntityModel.insertMany(newEntities);
  return newEntities;
}


export async function processDoubleStepEntity(entity: IEntity) {
  const { sourceType, subSetType, id: entityId } = entity;

  const actorId = APIFY_ACTOR_ID[sourceType][subSetType];
  if (!actorId) throw new Error(`There is no actorId for ${sourceType} - ${subSetType}`);

  const userKnowledgeList = await getUserKnowledgeByEntityId(entityId);
  if (!userKnowledgeList.length) {
    throw new Error(`No userknowledge found for entity - ${entityId}`);
  }
  const userIdList = userKnowledgeList.map((doc) => doc.userId);
  //console.log("userIdList----->", userIdList);

  // run actor
  const apifyInput = generateInputForApifyActor(actorId, entity);
  const actorRunResult = await startApifyActor(actorId, apifyInput);

  if (actorRunResult.status !== "SUCCEEDED") {
    console.error(actorRunResult);
    throw new Error("Apify actor run not suceeded");
  }

  // fetch results from actor run
  const fetchActorResult = await fetchActorResults(
    actorRunResult.defaultDatasetId
  );
  //console.log("fetchActorResult.items----->", fetchActorResult?.items);

  if (!fetchActorResult?.items.length) {
    //console.log("List of scraped data is empty", fetchActorResult);
    return;
  }

  // create new entities based on data received from scrapper
  const entityList = getEntitiesFromScrapedData(actorId, entityId, fetchActorResult?.items);

  // check if entity is already added
  const entityIdList: string[] = [];
  const entitiesToInsert: unknown[] = [];

  for (const entity of entityList) {
    const { sourceType, subSetType, value } = entity;
    // find for same entity
    const entityFound = await EntityModel.findOne({
      sourceType: sourceType,
      subSetType: subSetType,
      value: value,
    });
    if (entityFound) {
      entityIdList.push(entityFound.id);
      continue;
    }
    entityIdList.push(entity.id);
    entitiesToInsert.push(entity);
  }

  // add entity IDs to userKnowledge collection of every user
  await userKnowledgeAddEntities(userIdList, entityIdList);

  // insert Entity
  const entities = await insertManyEntities(entitiesToInsert);
  //console.log("entities", entities);

}


export function arrangeNewsURLScrapedData<T>(
  entityList: IEntity[],
  scrapedData: T[]
) {
  const arrangedScrapedData: Array<T> = [];
  for (const entity of entityList) {
    let foundScrapedData = scrapedData?.find((data) => {
      return (data as { link?: string })?.link === entity.value;
    });
    if (!foundScrapedData) {
      console.error(
        `Error: no scraped data found for entity - ${entity?.id}, value - ${entity.value}`
      );
      foundScrapedData = {
        content: "",
        link: entity.value,
        publishedAt: null,
        source: "",
        title: "",
      } as T;
    }
    arrangedScrapedData.push(foundScrapedData);
  }
  return arrangedScrapedData;
}

export function arrangeRedditURLScrapedData<T>(
  scrapedData: T[]
) {
  const post = scrapedData.find((_) => (_ as { dataType: "post" | "comment" }).dataType === "post") as RedditPost;
  if (!post) throw new Error("No post found for the reddit");

  const comments: RedditComment[] = [];

  scrapedData.forEach((_) => {
    if ((_ as { dataType: "post" | "comment" }).dataType === "comment") {
      const scraped = _ as RedditComment;
      comments.push(scraped);
    }
  });

  // post.comments = comments;
  const redditData = [{
    ...post,
    comments: comments
  }]
  return redditData;
}

export function formatNewsURLScrapedData(
  actorId: string,
  scrapedData: Record<string | number, unknown>[]
) {
  if (actorId === googleNewsApifyActorId) {
    return scrapedData.map((newsData) => {
      const { url = "", text = "", metadata } = newsData as GoogleNewsData;
      return {
        content: text,
        link: url,
        publishedAt: null,
        source: metadata?.author,
        title: metadata?.title,
      };
    });
  }
  return scrapedData.map((newsData) => {
    const { title, published, content = "", url = "", source } = newsData;
    return {
      content: content,
      link: url,
      publishedAt: published,
      source: source,
      title: title,
    };
  });
}

export async function processGoogleNewsURLEntities(entityList: IEntity[], userIdList: string[]) {
  if (!entityList.length || !userIdList.length) return;
  const actorId = googleNewsApifyActorId;
  const entityIdList = entityList.map((e) => e.id);
  const actorInput = generateInputForApifyActor(actorId, entityList);

  // run apify actor and scrap data
  const fetchedActorJob = await agenda.create<IRunApifyActorAgenda>(
    RUN_APIFY_ACTOR_AND_GET_DATA_AGENDA,
    { id: actorId, input: actorInput }
  ).run();
  const scrapDataApifyResponse = fetchedActorJob.attrs.result as ActorResponse;
  let scrapedData = scrapDataApifyResponse?.items;

  // update the field "isScraped" to true
  await updateManyEntities(
    { id: { $in: entityIdList } },
    { isScraped: true, isNoData:  !scrapedData.length }
  );

  if (!scrapedData.length) {
    console.error(
      `Error: Empty scraped data from Apify actor run response.
       actorId - ${actorId}, entityIds - ${entityIdList?.join(",")}`
    );
    return;
  }
  //console.log("scrapedData length----->", scrapedData.length);

  // format scraped data
  scrapedData = formatNewsURLScrapedData(actorId, scrapedData)

  // arrange scraped data in order of entityList
  scrapedData = arrangeNewsURLScrapedData(entityList, scrapedData);

  // add entity ID to scraped data
  scrapedData = scrapedData.map((data, index) => ({
    ...data,
    entityId: entityIdList[index],
  }));

  // save scraped data to mongoDB in appropriate collection
  const scrapedDataMongoDBRecords = await saveScrapedDataToMongoDB(
    { sourceType: "news", subSetType: "url" },
    scrapedData
  );

  for (const [index, scrapedEntityData] of scrapedDataMongoDBRecords.entries()) {
    const text = scrapedEntityData.get("content", String);
    if (!text) {
      throw new Error(
        `No text content found in source actorId="${actorId}"`
      );
    }
    //console.log("text----->", text.trim().slice(0, 100));

    // create vectors for each users
    for (const userId of userIdList) {

      // run Embedding + Upserting Apify actor
      const vectorApifyResponse = await createAndUpsertPineconeVectorViaApify({
        namespace: userId,
        text: text,
      });

      // increment totalEmbeddingTokenUsed
      const embeddingTokenUsed = vectorApifyResponse?.items?.reduce(
        (tokenCount, item) => {
          return tokenCount + (item?.token_count || 0);
        },
        0
      );
      const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
        { userId: userId },
        {
          $inc: {
            totalEmbeddingTokenUsed: embeddingTokenUsed,
          },
        },
        { upsert: true, new: true }
      );

      const vectorsId = vectorApifyResponse?.items;
      //console.log("vectorsId----->", vectorsId);

      // store data in userVector collection of mongoDB
      // order remains same for entity and scraped data therefor entityId = entityIdList[index]
      const userVector = await createUserVector({
        userId: userId,
        entityId: scrapedEntityData?.entityId || "",
        vectorsId: vectorsId,
      });
      //console.log("userVector----->", userVector);
    }
  }
}


export async function processTwitterThreadEntities(entityList: IEntity[], userIdList: string[]) {
  if (!entityList.length || !userIdList.length) return;
  const actorId = APIFY_ACTOR_ID.twitter.thread;
  for (const entity of entityList) {
    const entityId = entity.id;
    const actorInput = generateInputForApifyActor(actorId, [entity]);

    // run apify actor and scrap data
    const fetchedActorJob = await agenda.create<IRunApifyActorAgenda>(
      RUN_APIFY_ACTOR_AND_GET_DATA_AGENDA,
      { id: actorId, input: actorInput }
    ).run();
    const scrapDataApifyResponse = fetchedActorJob.attrs.result as ActorResponse;

    let scrapedData = scrapDataApifyResponse?.items;

    // update the field "isScraped" to true
    await updateManyEntities(
      { id: { $in: [entityId] } },
      { isScraped: true, isNoData:  !scrapedData.length }
    );

    if (!scrapedData.length) {
      console.error(
        `Error: Empty scraped data from Apify actor run response.
       actorId - ${actorId}, entityId - ${entityId}`
      );
      continue;
    }
    //console.log("scrapedData length----->", scrapedData.length);

    // add entity ID to scraped data
    scrapedData = scrapedData.map((data, index) => ({
      ...data,
      entityId: entityId,
    }));

    // save scraped data to mongoDB in appropriate collection
    const scrapedDataMongoDBRecords = await saveScrapedDataToMongoDB(
      { sourceType: "twitter", subSetType: "thread" },
      scrapedData
    );

    // combine all the texts fields
    const textArray: string[] = scrapedData.map(data => {
      return (data as { text: string })?.text ?? "";
    });
    const text = textArray.join(" ");
    if (!text) {
      throw new Error(
        `No text content to join found in source actorId="${actorId}"`
      );
    }
    //console.log("text starting with ----->", text.trim().slice(0, 100));

    // create vectors for each users
    for (const userId of userIdList) {

      // run Embedding + Upserting Apify actor
      const vectorApifyResponse = await createAndUpsertPineconeVectorViaApify({
        namespace: userId,
        text: text,
      });

      // increment totalEmbeddingTokenUsed
      const embeddingTokenUsed = vectorApifyResponse?.items?.reduce(
        (tokenCount, item) => {
          return tokenCount + (item?.token_count || 0);
        },
        0
      );
      const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
        { userId: userId },
        {
          $inc: {
            totalEmbeddingTokenUsed: embeddingTokenUsed,
          },
        },
        { upsert: true, new: true }
      );

      const vectorsId = vectorApifyResponse?.items;
      //console.log("vectorsId----->", vectorsId);

      // store data in userVector collection of mongoDB
      // order remains same for entity and scraped data therefor entityId = entityIdList[index]
      const userVector = await createUserVector({
        userId: userId,
        entityId: entityId,
        vectorsId: vectorsId,
      });
      //console.log("userVector----->", userVector);
    }
  }
}


export async function processGitbookUrlEntities(entityList: IEntity[], userIdList: string[]) {
  if (!entityList.length || !userIdList.length) return;
  for (const entity of entityList) {
    const {value:entityValue, id: entityId} = entity;

    let docs = await gitbookPost(entityValue)
    
    // update the field "isScraped" to true
    await updateManyEntities(
      { id: { $in: [entityId] } },
      { isScraped: true, isNoData: !docs || !docs?.length }
    );

    const gitbookDoc ={
      content: docs,
      entityId: entityId,
      url:entityValue
    }

    // save scraped data to mongoDB in appropriate collection
    const scrapedDataMongoDBRecords = await saveDataToMongoDB(
      { sourceType: "gitbook", subSetType: "url" },
      gitbookDoc
    );
  }
}

export async function processGithubUrlEntities(
  entityList: IEntity[],
  userIdList: string[]
) {
  if (!entityList.length || !userIdList.length) return;
  for (const entity of entityList) {
    const { value: entityValue, id: entityId } = entity;

    let docs = await githubRepo(entityValue);
    const githubDoc = {
      content: docs,
      entityId: entityId,
      url: entityValue,
    };

    // save scraped data to mongoDB in appropriate collection
    const scrapedDataMongoDBRecords = await saveDataToMongoDB(
      { sourceType: "github", subSetType: "url" },
      githubDoc
    );

    // "isScraped" & "isNoData" to true
    await updateManyEntities({ id: { $in: [entityId] } }, { isScraped: true, isNoData: !docs || !docs?.length });
  }
}
export async function processBubblemapsUrlEntities(
  entityList: IEntity[],
  userIdList: string[]
) {
  if (!entityList.length || !userIdList.length) return;
  for (const entity of entityList) {
    let { value: entityValue, id: entityId, subSetType, sourceType } = entity;
    let docs = await getBubblemapsScrapedDataRequest(entity);

    if(!docs) {
      await updateManyEntities({ id: { $in: [entityId] } }, { isScraped: true, isNoData: true });
      return;
    }

    docs.entityId = entityId
    docs.url = entityValue
  
    // save scraped data to mongoDB in appropriate collection
    const scrapedDataMongoDBRecords = await saveDataToMongoDB(
      { sourceType, subSetType },
      docs
    );

    // "isScraped" & "isNoData" to true
    await updateManyEntities({ id: { $in: [entityId] } }, { isScraped: true, isNoData: false });
  }
}

export async function processEntity(entity: IEntity) {
  try {
    let { sourceType, subSetType, isScraped, id: entityId, value } = entity;
    sourceType = sourceType.toLowerCase();
    subSetType = subSetType.toLowerCase();

    let actorId = APIFY_ACTOR_ID[sourceType][subSetType];

    // using different actor for google news
    if (
      sourceType === "news" &&
      subSetType === "url" &&
      value.includes("news.google.com")
    ) {
      actorId = googleNewsApifyActorId;
    }

    if (!actorId) throw new Error(`There is no actorId for ${sourceType} - ${subSetType}`);

    const userKnowledgeList = await getUserKnowledgeByEntityId(entityId);
    if (!userKnowledgeList.length) {
      throw new Error(`No userknowledge found for entity - ${entityId}`);
    }
    const userIdList = userKnowledgeList.map((doc) => doc.userId);
    //console.log("userIdList----->", userIdList);

    const isDoubleStep = isDoubleStepApifyProcess({ sourceType, subSetType });
    // return if process is double-step
    if (isDoubleStep) {
      processDoubleStepEntity(entity);
      return;
    }

    // return if process is scrapped (already returned if process is double-step)
    if (isScraped) return;

    const apifyInput = generateInputForApifyActor(actorId, entity);

    // run actor
    const actorRunResult = await startApifyActor(actorId, apifyInput);

    if (actorRunResult.status !== "SUCCEEDED") {
      console.error(actorRunResult);
      throw new Error("Apify actor run not suceeded");
    }

    // fetch results from actor run
    const fetchActorResult = await fetchActorResults(
      actorRunResult.defaultDatasetId
    );
    let scrapedData = fetchActorResult?.items;
    //console.log("scrapedData----->", scrapedData);

    // update the field "isScraped" to true for entity
    await entityFindByIdAndUpdate(entity._id, { isScraped: true, isNoData: !scrapedData.length });

    if (!scrapedData.length) {
      console.error(
        `Error: Empty scraped data from Apify actor run response.
       actorId - ${actorId}, entityId - ${entityId}`
      );
      return;
    }

    // adjust fields for news-url
    if (sourceType === "news" && subSetType === "url") {
      scrapedData = formatNewsURLScrapedData(actorId, scrapedData)
    }

    // add entity ID to scraped data
    scrapedData = scrapedData.map((data, index) => ({
      ...data,
      entityId,
    }));

    //console.log("scrapedData----->", scrapedData);

    // save scraped data to mongoDB in appropriate collection
    const scrapedDataMongoDBRecords = await saveScrapedDataToMongoDB(
      { sourceType, subSetType },
      scrapedData
    );
    // console.log("scrapedDataMongoDbRecords----->",scrapedDataMongoDBRecords?.map((doc) => doc._id));

    for (const userId of userIdList) {

      // filter to check uservector already exists
      const userVectorfound = await findOneUserVector({
        userId: userId,
        entityId: entityId,
      });
      if (userVectorfound) {
        //console.log("userVectorfound", userVectorfound);
        continue;
      }

    for (const scrapedData of scrapedDataMongoDBRecords) {
      const text = getTextContent(actorId, scrapedData);
      //console.log("text----->", text);

      if (!text) {
        throw new Error(
          `No text content found in source, 
          actorId="${actorId}"
          scrapedDataId="${scrapedData._id}"`
        );
      }

      // run Embedding + Upserting Apify actor
      const vectorsResult = await createAndUpsertPineconeVectorViaApify({
        namespace: userId,
        text: text,
      });
      // increment totalEmbeddingTokenUsed
      const embeddingTokenUsed = vectorsResult?.items?.reduce(
        (tokenCount, item) => {
          return tokenCount + (item?.token_count || 0);
        },
        0
      );
      const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
        { userId: userId },
        {
          $inc: {
            totalEmbeddingTokenUsed: embeddingTokenUsed,
          },
        },
        { upsert: true, new: true }
      );

      const vectorIdList = vectorsResult?.items;
      //console.log("vectors----->", vectorIdList);

      // // update vectors field of scrapedData Document
      // const updatedDocument = await updateScrapedDataDocumentById(
      //   entity,
      //   scrapedData._id,
      //   {
      //     vectors: vectorIdList,
      //   }
      // );
      // //console.log("updatedDocument----->", updatedDocument);

      // store data in userVector collection of mongoDB
      const userVector = await createUserVector({
        userId: userId,
        entityId: entityId,
        vectorsId: vectorIdList,
      });

      //console.log("userVector----->", userVector);
    }
    }
  } catch (error) {
    console.error(error);
  }
}

export async function processDoubleStepEntities() {
  try {
    //console.log("processing double step entities...");
    const doubleStepEntities = await getAllDoubleStepEntity();
    if (!doubleStepEntities?.length) {
      //console.log("No double step entities found");
      return;
    }

    for (const entity of doubleStepEntities) {
      processDoubleStepEntity(entity);
    }
  } catch (error) {
    console.error(error);
  }
}

export async function findEntityDocuments(
  filter: FilterQuery<IEntity>,
  projection?: ProjectionType<IEntity>,
  options?: QueryOptions<IEntity>
) {
  return await EntityModel.find(filter, projection, options);
}

export async function findDistinctEntities(
  filter: FilterQuery<IEntity>,
  field: keyof IEntity
) {
  return await EntityModel.find(filter).distinct(field);
}

export async function findEntitiesWithUserVectors(
  filter: FilterQuery<IEntity>
) {
  const entityWithUserVectorsPipeline = [
    {
      $match: filter,
    },
    {
      $lookup: {
        from: "uservectors",
        localField: "id",
        foreignField: "entityId",
        as: "userVectors",
      },
    },
  ];

  return await EntityModel.aggregate(entityWithUserVectorsPipeline);
}

export async function findOneAndUpdateEntityDocument(
  filter?: FilterQuery<IEntity>,
  update?: UpdateQuery<IEntity>,
  options?: QueryOptions<IEntity>
) {
  return await EntityModel.findOneAndUpdate(filter, update, options);
};

export async function createEntityDocument(doc: Partial<IEntity>) {
  return await EntityModel.create(doc);
}

// session is not supported for create one document
export async function createEntities(
  docs: Array<Partial<IEntity>>,
  options?: CreateOptions
) {
  return await EntityModel.create(docs, options);
}

export function formatLinkedScrapedData(
  scrapedData: Record<string | number, unknown>[],
  otherProps: { url: string }
) {
  // Advanced Linkedin job scraper(APIFY actor) returns with array of 10 job data
  const jobs = scrapedData.map((linkedInData) => {
    // delete some fields
    delete linkedInData?.companyDescription;
    delete linkedInData?.companyAddress;
    delete linkedInData?.companySlogan;
    delete linkedInData?.companyEmployeesCount;
    delete linkedInData?.companyLinkedinUrl;
    delete linkedInData?.companyLogo;
    delete linkedInData?.refId;
    return linkedInData;
  });
  return [
    {
      jobs: jobs,
      ...otherProps,
    },
  ];
}
