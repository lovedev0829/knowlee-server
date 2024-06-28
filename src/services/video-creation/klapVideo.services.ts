import {
  CreateOptions,
  FilterQuery,
  InsertManyOptions,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
} from "mongoose";
import KlapVideo, {
  IKlapVideoDocument,
} from "../../models/video-creation/KlapVideo.model";

export async function findKlapVideoDocuments(
  filter: FilterQuery<IKlapVideoDocument>,
  projection?: ProjectionType<IKlapVideoDocument>,
  options?: QueryOptions<IKlapVideoDocument>
) {
  return await KlapVideo.find(filter, projection, options);
}

export async function createKlapVideoDocument(
  docs: IKlapVideoDocument,
  options?: CreateOptions
) {
  return await KlapVideo.create(docs, options);
}

export const findOneAndUpdateKlapVideoDocument = async (
  filter?: FilterQuery<IKlapVideoDocument>,
  update?: UpdateQuery<IKlapVideoDocument>,
  options?: QueryOptions<IKlapVideoDocument>
) => {
  return await KlapVideo.findOneAndUpdate(filter, update, options);
};

export const findByIdAndUpdateKlapVideoDocument = async (
  id: string,
  update: UpdateQuery<IKlapVideoDocument>
) => {
  return await KlapVideo.findByIdAndUpdate(id, update);
};

export const findByIdAndDeleteKlapVideoDocument = async (
  id: string,
  options?: QueryOptions<IKlapVideoDocument>
) => {
  return await KlapVideo.findByIdAndDelete(id, options);
};

export async function findOneKlapVideoDocument(
  filter?: FilterQuery<IKlapVideoDocument>,
  projection?: ProjectionType<IKlapVideoDocument>,
  options?: QueryOptions<IKlapVideoDocument>
) {
  return await KlapVideo.findOne(filter, projection, options);
}

export async function findByIdKlapVideoDocument(id: string) {
  return await KlapVideo.findById(id);
}

export async function createOneKlapVideo(doc: Partial<IKlapVideoDocument>) {
  return await KlapVideo.create(doc);
}

export const countKlapVideo = async (
  filter?: FilterQuery<IKlapVideoDocument>
) => {
  return await KlapVideo.count(filter);
};

export const insertManyKlapVideo = async (
  docs: Partial<IKlapVideoDocument>[],
  options: InsertManyOptions
) => {
  return await KlapVideo.insertMany(docs, options);
};
