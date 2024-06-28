import {
  CreateOptions,
  FilterQuery,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
} from "mongoose";
import UserThreadModel, {
  IUserThreadDocument,
} from "../../models/knowlee-agent/UserThread.model";
import { findUser } from "../user.services";
import { findOneAndUpdateUserUsageStatDocument } from "../userUsageStat.services";

export async function findUserThreadDocuments(
  filter: FilterQuery<IUserThreadDocument>,
  projection?: ProjectionType<IUserThreadDocument>,
  options?: QueryOptions<IUserThreadDocument>
) {
  return await UserThreadModel.find(filter, projection, options);
}
export async function createUserThreadDocuments(
  filter: FilterQuery<IUserThreadDocument>,
  projection?: ProjectionType<IUserThreadDocument>,
  options?: QueryOptions<IUserThreadDocument>
) {
  return await UserThreadModel.find(filter, projection, options);
}

export async function createUserThreadDocument(
  docs: IUserThreadDocument,
  options?: CreateOptions
) {
  return await UserThreadModel.create(docs, options);
}

export const findOneAndUpdateUserThreadDocument = async (
  filter?: FilterQuery<IUserThreadDocument>,
  update?: UpdateQuery<IUserThreadDocument>,
  options?: QueryOptions<IUserThreadDocument>
) => {
  return await UserThreadModel.findOneAndUpdate(filter, update, options);
};

export const findByIdAndUpdateUserThreadDocument = async (
  id: string,
  update: UpdateQuery<IUserThreadDocument>,
) => {
  return await UserThreadModel.findByIdAndUpdate(id, update);
};

export const findByIdAndDeleteUserThreadDocument = async (
  id: string,
  options?: QueryOptions<IUserThreadDocument>,
) => {
  return await UserThreadModel.findByIdAndDelete(id, options);
};

export async function findOneUserThread(filter?: FilterQuery<IUserThreadDocument>) {
  const userThread = await UserThreadModel.findOne(filter);
  return userThread;
}

export async function findByIdUserThread(id: string) {
  const userThread = await UserThreadModel.findById(id);
  return userThread;
}

export const countUserThread = async (
  filter?: FilterQuery<IUserThreadDocument>,
) => {
  return await UserThreadModel.count(filter);
};

export async function recalculateUserUsageThreadCount() {
  // get all users
  const userList = await findUser({});

  // for each user
  for (const user of userList) {
    const { id: userId } = user;
    const userThreadCount = await countUserThread({ creatorId: userId });

    //console.log("userThreadCount----->", userId, userThreadCount);
    await findOneAndUpdateUserUsageStatDocument(
      { userId: userId },
      {
        $set: {
          userThreadCount: userThreadCount,
        },
      },
      { upsert: true, new: true }
    );
  }
  //console.log("DONE: recalculated User Usage for userThreadCount");
}

// the hook also deletes the threads from openAI
export const deleteManyUserThreads = async (
  filter?: FilterQuery<IUserThreadDocument>,
  options?: QueryOptions<IUserThreadDocument>
) => {
  return await UserThreadModel.deleteMany(filter, options);
};
