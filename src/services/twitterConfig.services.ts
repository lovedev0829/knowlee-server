import { FilterQuery, ProjectionType, QueryOptions, UpdateQuery } from "mongoose";
import TwitterConfigModel, { ITwitterConfig } from "../models/twitter/TwitterConfig.model";

export async function findOneTwitterConfig(
    filter: FilterQuery<ITwitterConfig>,
    projection?: ProjectionType<ITwitterConfig>,
    options?: QueryOptions<ITwitterConfig>
) {
    return await TwitterConfigModel.findOne(filter, projection, options);
}

export const findOneAndUpdateTwitterConfig = async (
    filter?: FilterQuery<ITwitterConfig>,
    update?: UpdateQuery<ITwitterConfig>,
    options?: QueryOptions<ITwitterConfig>
  ) => {
    return await TwitterConfigModel.findOneAndUpdate(filter, update, options);
  };