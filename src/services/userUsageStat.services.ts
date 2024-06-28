import {
  CreateOptions,
  FilterQuery,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
} from "mongoose";
import UserUsageStatModel, { IUserUsageStat } from "../models/UserUsageStat.model";

export async function findUserUsageStatDocuments(
  filter: FilterQuery<IUserUsageStat>,
  projection?: ProjectionType<IUserUsageStat>,
  options?: QueryOptions<IUserUsageStat>
) {
  return await UserUsageStatModel.find(filter, projection, options);
}
export async function createUserUsageStatDocuments(
  filter: FilterQuery<IUserUsageStat>,
  projection?: ProjectionType<IUserUsageStat>,
  options?: QueryOptions<IUserUsageStat>
) {
  return await UserUsageStatModel.find(filter, projection, options);
}

export async function createUserUsageStatDocument(
  docs: IUserUsageStat,
  options?: CreateOptions
) {
  return await UserUsageStatModel.create(docs, options);
}

export const findOneAndUpdateUserUsageStatDocument = async (
  filter?: FilterQuery<IUserUsageStat>,
  update?: UpdateQuery<IUserUsageStat>,
  options?: QueryOptions<IUserUsageStat>
) => {
  return await UserUsageStatModel.findOneAndUpdate(filter, update, options);
};

export const findByIdAndUpdateUserUsageStatDocument = async (
  id: string,
  update: UpdateQuery<IUserUsageStat>,
) => {
  return await UserUsageStatModel.findByIdAndUpdate(id, update);
};

export const findByIdAndDeleteUserUsageStatDocument = async (
  id: string,
  options?: QueryOptions<IUserUsageStat>,
) => {
  return await UserUsageStatModel.findByIdAndDelete(id, options);
};

export async function findOneUserUsageStatDocument(filter?: FilterQuery<IUserUsageStat>, projection?: ProjectionType<IUserUsageStat>, options?: QueryOptions<IUserUsageStat>) {
  const userUsageStat = await UserUsageStatModel.findOne(filter, projection, options);
  return userUsageStat;
}

export async function findByIdUserUsageStatDocument(id: string) {
  const userUsageStat = await UserUsageStatModel.findById(id);
  return userUsageStat;
}


export async function createUserUsageStat(doc: Partial<IUserUsageStat>) {
  return await UserUsageStatModel.create(doc);
}

export const countUserUsageStat = async (
  filter?: FilterQuery<IUserUsageStat>,
) => {
  return await UserUsageStatModel.count(filter);
};

export async function getTotalTokenUsed(filter: any) {
  return await UserUsageStatModel.aggregate([
    {
      $match: filter  // Apply the filter here
    },
    {
      $group: {
        _id: "totalTokenUsed",
        totalTokenUsed: { $sum: "$totalRunTokenUsed" },
      },
    },
    {
      $project: {
        totalTokenUsed: "$totalTokenUsed",
      },
    },
  ]);
}
