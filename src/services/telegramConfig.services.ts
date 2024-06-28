import {
  FilterQuery,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
} from "mongoose";
import TelegramConfigModel, {
  ITelegramConfig,
} from "../models/telegram/TelegramConfig.model";

export async function findOneTelegramConfig(
  filter: FilterQuery<ITelegramConfig>,
  projection?: ProjectionType<ITelegramConfig>,
  options?: QueryOptions<ITelegramConfig>
) {
  return await TelegramConfigModel.findOne(filter, projection, options);
}

export const findOneAndUpdateTelegramConfig = async (
  filter?: FilterQuery<ITelegramConfig>,
  update?: UpdateQuery<ITelegramConfig>,
  options?: QueryOptions<ITelegramConfig>
) => {
  return await TelegramConfigModel.findOneAndUpdate(filter, update, options);
};
