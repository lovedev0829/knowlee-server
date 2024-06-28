import { EntityModel } from "../../../models/entity.model";
import { LocalEntityModel } from "../../../models/localEntity.model";
import { User } from "../../../models/user.model";
import { UserKnowledgeModel } from "../../../models/userKnowledge.model";
import { findOneDocRecord } from "../../docRecord.services";
import { doubleStepCombinations, findOneEntity } from "../../entity.services";
import { findLocalEntity } from "../../localEntity.service";
import { getScrapedDataByEntity } from "../../scrap.services";

export async function getEntityFunction({
  user,
  queryObject,
}: {
  user: User;
  queryObject: any;
}) {
  // const session: ClientSession = req.session!;
  if (!user) return "please provide user";

  const { id: userId } = user;

  // const queryObject = req.query

  interface IFilter {
    [key: string]: string | boolean | any;
  }

  interface ISorting {
    [fieldName: string]: 1 | -1;
  }

  const filter: IFilter = {};
  let userVectorConditions = {};
  const sort: ISorting = {};
  if (queryObject.sourceType) {
    filter.sourceType = queryObject.sourceType;
  }

  if (queryObject.subSetType) {
    filter.subSetType = queryObject.subSetType;
  }

  if (queryObject.status) {
    if (queryObject.status === "multi-step") {
      filter.$or = doubleStepCombinations;
    }

    if (queryObject.status === "learned") {
      // temporary pinecone paused
      filter.isScraped = true; //added temp
      userVectorConditions = {
        "userVectors.0": { $exists: false }, 
      };
    }
    //
    if (queryObject.status === "in-progress") {
      filter.$nor = doubleStepCombinations;
      filter.isScraped = false;
      userVectorConditions = {
        $expr: { $eq: [{ $size: "$userVectors" }, 0] }, // Matches records with userVectors array length = 0
      };
    }

    if (queryObject.status === "no-data") {
      filter.$nor = doubleStepCombinations;
      filter.isNoData = true;
    }

    if (queryObject.status === "data-found") {
      filter.$nor = doubleStepCombinations;
      filter.isScraped = true;
      userVectorConditions = {
        "userVectors.0": { $exists: true }, 
      };
    }
  }

  // lastAdded
  if (queryObject.startDate && queryObject.endDate) {
    const startDate = new Date(queryObject.startDate as string);
    const endDate = new Date(queryObject.endDate as string);
    filter.createdAt = { $gte: startDate, $lte: endDate };
  }

  let allowNoData = false;
  if (queryObject.allowNoData) {
    allowNoData = queryObject.allowNoData === "true" ? true : false;
    if (!allowNoData) {
      filter.isNoData = {
        $ne: true,
      };
    }
  }

  let sortCriteria: ISorting = {};
  if (queryObject.sortBy) {
    sortCriteria[queryObject.sortBy as string] =
      queryObject.sortOrder === "desc" ? -1 : 1;
  } else {
    sortCriteria["createdAt"] = -1;
  }

  const userKnowledge = await UserKnowledgeModel.findOne(
    { userId }
  );
  // This is an array of entity ids
  const entities = userKnowledge?.entities || [];

  const entityWithUserVectorsPipeline = [
    {
      $match: {
        id: { $in: entities },
        originId: { $exists: false },
        ...filter,
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
      $sort: sortCriteria,
    },
  ];

  let allowUploadedFiles = false;
  if (queryObject.allowUploadedFiles) {
    allowUploadedFiles = queryObject.allowUploadedFiles === "true";
    if (allowUploadedFiles) {
      const alllocalEntities = await LocalEntityModel.aggregate(
        entityWithUserVectorsPipeline
      );
      return alllocalEntities;
    }
  }
  const allUserEntities = await EntityModel.aggregate(
    entityWithUserVectorsPipeline
  )
    .unionWith({
      coll: "localentities",
      pipeline: entityWithUserVectorsPipeline,
    })
    .sort({ createdAt: -1 });
  return allUserEntities;
}

export async function getLocalEntityFunction({
  entityId,
  user
}: {
  entityId: string;
  user:User;
}) {
  if (!user) return "please provide user";

  try {
    const localEntity = await findLocalEntity({ id: entityId });
    return localEntity;
  } catch (error: any) {
    //console.log(error);
    return error?.message;
  }
}

export async function getScrapedDataFunction({
  entityId,
  user,
}: {
  entityId: string;
  user:User;
}) {
  if (!user) return "please provide user";

  try {

    const entity = await findOneEntity({ id: entityId });
    if (entity) {
      const data = await getScrapedDataByEntity(entity);
      if (data) {
        return data;
      }
    }

    const docRecord = await findOneDocRecord({ entityId: entityId });
    if (docRecord) {
      return docRecord;
    }
  } catch (error: any) {
    //console.log(error);
    return error?.message;
  }
}
