import {
  CreateOptions,
  FilterQuery,
  InsertManyOptions,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
} from "mongoose";
import KlapExportedClip, {
  IKlapExportedClipDocument,
} from "../../models/video-creation/KlapExportedClip.model";

export async function findKlapExportedClipDocuments(
  filter: FilterQuery<IKlapExportedClipDocument>,
  projection?: ProjectionType<IKlapExportedClipDocument>,
  options?: QueryOptions<IKlapExportedClipDocument>
) {
  return await KlapExportedClip.find(filter, projection, options);
}

export async function createKlapExportedClipDocument(
  docs: IKlapExportedClipDocument,
  options?: CreateOptions
) {
  return await KlapExportedClip.create(docs, options);
}

export const findOneAndUpdateKlapExportedClipDocument = async (
  filter?: FilterQuery<IKlapExportedClipDocument>,
  update?: UpdateQuery<IKlapExportedClipDocument>,
  options?: QueryOptions<IKlapExportedClipDocument>
) => {
  return await KlapExportedClip.findOneAndUpdate(filter, update, options);
};

export const findByIdAndUpdateKlapExportedClipDocument = async (
  id: string,
  update: UpdateQuery<IKlapExportedClipDocument>
) => {
  return await KlapExportedClip.findByIdAndUpdate(id, update);
};

export const findByIdAndDeleteKlapExportedClipDocument = async (
  id: string,
  options?: QueryOptions<IKlapExportedClipDocument>
) => {
  return await KlapExportedClip.findByIdAndDelete(id, options);
};

export async function findOneKlapExportedClipDocument(
  filter?: FilterQuery<IKlapExportedClipDocument>,
  projection?: ProjectionType<IKlapExportedClipDocument>,
  options?: QueryOptions<IKlapExportedClipDocument>
) {
  return await KlapExportedClip.findOne(filter, projection, options);
}

export async function findByIdKlapExportedClipDocument(id: string) {
  return await KlapExportedClip.findById(id);
}

export async function createOneKlapExportedClip(
  doc: Partial<IKlapExportedClipDocument>
) {
  return await KlapExportedClip.create(doc);
}

export const countKlapExportedClip = async (
  filter?: FilterQuery<IKlapExportedClipDocument>
) => {
  return await KlapExportedClip.count(filter);
};

export const insertManyKlapExportedClip = async (
  docs: Partial<IKlapExportedClipDocument>[],
  options: InsertManyOptions
) => {
  return await KlapExportedClip.insertMany(docs, options);
};
