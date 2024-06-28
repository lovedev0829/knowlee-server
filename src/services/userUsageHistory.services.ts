import {
  FilterQuery,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
} from "mongoose";
import UserUsageHistoryModel, {
  IUserUsageHistory,
} from "../models/UserUsageHistory.model";

export async function findUserUsageHistoryDocuments(
  filter: FilterQuery<IUserUsageHistory>,
  projection?: ProjectionType<IUserUsageHistory>,
  options?: QueryOptions<IUserUsageHistory>
) {
  return await UserUsageHistoryModel.find(filter, projection, options);
}

export async function createOneUserUsageHistoryDocument(
  doc: Partial<IUserUsageHistory>
) {
  return await UserUsageHistoryModel.create(doc);
}

export const findOneAndUpdateUserUsageHistoryDocument = async (
  filter?: FilterQuery<IUserUsageHistory>,
  update?: UpdateQuery<IUserUsageHistory>,
  options?: QueryOptions<IUserUsageHistory>
) => {
  return await UserUsageHistoryModel.findOneAndUpdate(filter, update, options);
};

export const findByIdAndUpdateUserUsageHistoryDocument = async (
  id: string,
  update: UpdateQuery<IUserUsageHistory>
) => {
  return await UserUsageHistoryModel.findByIdAndUpdate(id, update);
};

export const findByIdAndDeleteUserUsageHistoryDocument = async (
  id: string,
  options?: QueryOptions<IUserUsageHistory>
) => {
  return await UserUsageHistoryModel.findByIdAndDelete(id, options);
};

export async function findOneUserUsageHistoryDocument(
  filter?: FilterQuery<IUserUsageHistory>,
  projection?: ProjectionType<IUserUsageHistory>,
  options?: QueryOptions<IUserUsageHistory>
) {
  return await UserUsageHistoryModel.findOne(filter, projection, options);
}

export async function findByIdUserUsageHistoryDocument(id: string) {
  return await UserUsageHistoryModel.findById(id);
}

export const countUserUsageHistoryDocument = async (
  filter?: FilterQuery<IUserUsageHistory>
) => {
  return await UserUsageHistoryModel.count(filter);
};
