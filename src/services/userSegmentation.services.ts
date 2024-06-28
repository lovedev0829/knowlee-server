import { FilterQuery } from "mongoose";
import { IUserSegmentation, UserSegmentationModel } from "../models/userSegmentation.model";
import { QueryOptions } from "mongoose";

export async function deleteManyUserSegmentations(
    filter?: FilterQuery<IUserSegmentation>,
    options?: QueryOptions<IUserSegmentation>
) {
    return await UserSegmentationModel.deleteMany(filter, options);
}
