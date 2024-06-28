import {
  FilterQuery,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
} from "mongoose";
import StatsPrice, { IStatsPrice } from "../../models/stripe/statsPrice.model";

export async function findStatsPriceDocuments(
  filter: FilterQuery<IStatsPrice>,
  projection?: ProjectionType<IStatsPrice>,
  options?: QueryOptions<IStatsPrice>
) {
  return await StatsPrice.find(filter, projection, options);
}

export async function createOneStatsPriceDocument(doc: Partial<IStatsPrice>) {
  return await StatsPrice.create(doc);
}

export const findOneAndUpdateStatsPriceDocument = async (
  filter?: FilterQuery<IStatsPrice>,
  update?: UpdateQuery<IStatsPrice>,
  options?: QueryOptions<IStatsPrice>
) => {
  return await StatsPrice.findOneAndUpdate(filter, update, options);
};

export const findByIdAndUpdateStatsPriceDocument = async (
  id: string,
  update: UpdateQuery<IStatsPrice>
) => {
  return await StatsPrice.findByIdAndUpdate(id, update);
};

export const findByIdAndDeleteStatsPriceDocument = async (
  id: string,
  options?: QueryOptions<IStatsPrice>
) => {
  return await StatsPrice.findByIdAndDelete(id, options);
};

export async function findOneStatsPriceDocument(
  filter?: FilterQuery<IStatsPrice>,
  projection?: ProjectionType<IStatsPrice>,
  options?: QueryOptions<IStatsPrice>
) {
  return await StatsPrice.findOne(filter, projection, options);
}

export async function findByIdStatsPriceDocument(id: string) {
  return await StatsPrice.findById(id);
}

export const countStatsPriceDocument = async (
  filter?: FilterQuery<IStatsPrice>
) => {
  return await StatsPrice.count(filter);
};
