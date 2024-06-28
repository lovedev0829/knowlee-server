import { ProjectionType, QueryOptions, UpdateQuery } from "mongoose";
import { FilterQuery } from "mongoose";
import { ILocalEntity, LocalEntityModel } from "../models/localEntity.model"

export const updateManyLocalEntities = async (
    filter: FilterQuery<ILocalEntity>,
    update: UpdateQuery<ILocalEntity>
  ) => {
    return await LocalEntityModel.updateMany(filter, update);
  };
  
export const updateOneLocalEntity = async (
  filter: FilterQuery<ILocalEntity>,
  update: UpdateQuery<ILocalEntity>,
  options?: QueryOptions<ILocalEntity>
) => {
  return await LocalEntityModel.updateOne(filter, update, options);
};

export async function findLocalEntity(
  filter: FilterQuery<ILocalEntity>,
  projection?: ProjectionType<ILocalEntity>,
  options?: QueryOptions<ILocalEntity>
) {
  return await LocalEntityModel.find(filter, projection, options);
}

export async function findOneAndUpdateLocalEntityDocument(
  filter?: FilterQuery<ILocalEntity>,
  update?: UpdateQuery<ILocalEntity>,
  options?: QueryOptions<ILocalEntity>
) {
  return await LocalEntityModel.findOneAndUpdate(filter, update, options);
};

export async function findDistinctLocalEntities(
  filter: FilterQuery<ILocalEntity>,
  field: keyof ILocalEntity
) {
  return await LocalEntityModel.find(filter).distinct(field);
}
