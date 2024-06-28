import {
  FilterQuery,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
} from "mongoose";
import MediumConfigModel, {
  IMediumConfig,
} from "../models/medium/MediumConfig.model";

export async function findOneMediumConfig(
  filter: FilterQuery<IMediumConfig>,
  projection?: ProjectionType<IMediumConfig>,
  options?: QueryOptions<IMediumConfig>
) {
  return await MediumConfigModel.findOne(filter, projection, options);
}

export const findOneAndUpdateMediumConfig = async (
  filter?: FilterQuery<IMediumConfig>,
  update?: UpdateQuery<IMediumConfig>,
  options?: QueryOptions<IMediumConfig>
) => {
  return await MediumConfigModel.findOneAndUpdate(filter, update, options);
};
