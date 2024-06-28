import { FilterQuery, QueryOptions } from "mongoose";
import UserVectorModel, { IUserVector } from "../models/userVector.model";

export async function createUserVector(doc: Partial<IUserVector>) {
    const userVector = new UserVectorModel(doc);
    return await userVector.save();
}

export async function findOneUserVector(filter?: FilterQuery<IUserVector>) {
    const userVector = await UserVectorModel.findOne(filter);
    return userVector;
}

export async function findUserVector(
    filter: FilterQuery<IUserVector>,
    options?: QueryOptions<IUserVector>
) {
    return await UserVectorModel.find(filter, options);
}

export async function deleteManyUserVectors(
    filter?: FilterQuery<IUserVector>,
    options?: QueryOptions<IUserVector>
) {
    return await UserVectorModel.deleteMany(filter, options);
}
