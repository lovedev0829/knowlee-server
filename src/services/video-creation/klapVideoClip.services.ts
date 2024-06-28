import {
  CreateOptions,
  FilterQuery,
  InsertManyOptions,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
} from "mongoose";
import KlapVideoClip, {
  IKlapVideoClipDocument,
} from "../../models/video-creation/KlapVideoClip.model";

export async function findKlapVideoClipDocuments(
  filter: FilterQuery<IKlapVideoClipDocument>,
  projection?: ProjectionType<IKlapVideoClipDocument>,
  options?: QueryOptions<IKlapVideoClipDocument>
) {
  return await KlapVideoClip.find(filter, projection, options);
}

export async function createKlapVideoClipDocument(
  docs: IKlapVideoClipDocument,
  options?: CreateOptions
) {
  return await KlapVideoClip.create(docs, options);
}

export const findOneAndUpdateKlapVideoClipDocument = async (
  filter?: FilterQuery<IKlapVideoClipDocument>,
  update?: UpdateQuery<IKlapVideoClipDocument>,
  options?: QueryOptions<IKlapVideoClipDocument>
) => {
  return await KlapVideoClip.findOneAndUpdate(filter, update, options);
};

export const findByIdAndUpdateKlapVideoClipDocument = async (
  id: string,
  update: UpdateQuery<IKlapVideoClipDocument>
) => {
  return await KlapVideoClip.findByIdAndUpdate(id, update);
};

export const findByIdAndDeleteKlapVideoClipDocument = async (
  id: string,
  options?: QueryOptions<IKlapVideoClipDocument>
) => {
  return await KlapVideoClip.findByIdAndDelete(id, options);
};

export async function findOneKlapVideoClipDocument(
  filter?: FilterQuery<IKlapVideoClipDocument>,
  projection?: ProjectionType<IKlapVideoClipDocument>,
  options?: QueryOptions<IKlapVideoClipDocument>
) {
  return await KlapVideoClip.findOne(filter, projection, options);
}

export async function findByIdKlapVideoClipDocument(id: string) {
  return await KlapVideoClip.findById(id);
}

export async function createOneKlapVideoClip(
  doc: Partial<IKlapVideoClipDocument>
) {
  return await KlapVideoClip.create(doc);
}

export const countKlapVideoClip = async (
  filter?: FilterQuery<IKlapVideoClipDocument>
) => {
  return await KlapVideoClip.count(filter);
};

export const insertManyKlapVideoClip = async (
  docs: Partial<IKlapVideoClipDocument>[],
  options: InsertManyOptions
) => {
  return await KlapVideoClip.insertMany(docs, options);
};
