import {
  CreateOptions,
  FilterQuery,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
} from "mongoose";
import DefaultAgentModel, {
  IDefaultAgentDocument,
} from "../../models/knowlee-agent/DefaultAgents.model";

export async function createDefaultAgentDocument(
  docs: Array<Partial<IDefaultAgentDocument>>,
  options?: CreateOptions
) {
  return await DefaultAgentModel.create(docs, options);
}

export async function createOneDefaultAgentDocument(
  doc: Partial<IDefaultAgentDocument>
) {
  return await DefaultAgentModel.create(doc);
}

export async function findDefaultAgentDocuments(
  filter: FilterQuery<IDefaultAgentDocument>,
  projection?: ProjectionType<IDefaultAgentDocument>,
  options?: QueryOptions<IDefaultAgentDocument>
) {
  return await DefaultAgentModel.find(filter, projection, options);
}

export async function findOneDefaultAgentDocument(
  filter: FilterQuery<IDefaultAgentDocument>,
  projection?: ProjectionType<IDefaultAgentDocument>,
  options?: QueryOptions<IDefaultAgentDocument>
) {
  return await DefaultAgentModel.findOne(filter, projection, options);
}

export const findOneAndUpdateDefaultAgent = async (
  filter?: FilterQuery<IDefaultAgentDocument>,
  update?: UpdateQuery<IDefaultAgentDocument>,
  options?: QueryOptions<IDefaultAgentDocument>
) => {
  return await DefaultAgentModel.findOneAndUpdate(filter, update, options);
};

// the hook also deletes the assistant & its files from openAI
export const deleteManyDefaultAgent = async (
  filter?: FilterQuery<IDefaultAgentDocument>,
  options?: QueryOptions<IDefaultAgentDocument>
) => {
  return await DefaultAgentModel.deleteMany(filter, options);
};
