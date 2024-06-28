import {
  FilterQuery,
  ProjectionType,
  QueryOptions,
} from "mongoose";
import OpenAIFunctionDefinitionModel, {
  IOpenAIFunctionDefinition,
} from "../../models/openai/OpenAIFunctionDefinition.model";

export async function findFunctionDefinitionDocuments(
  filter: FilterQuery<IOpenAIFunctionDefinition>,
  projection?: ProjectionType<IOpenAIFunctionDefinition>,
  options?: QueryOptions<IOpenAIFunctionDefinition>
) {
  return await OpenAIFunctionDefinitionModel.find(filter, projection, options);
}

export async function findFunctionDefinitionDocumentsWithGrouping(
  filter: FilterQuery<IOpenAIFunctionDefinition>,
) {
  const aggregationPipeline = [
    { $match: filter },
    { $group: { _id: "$functionType", data: { $push: "$$ROOT" } } },
    { $project: { _id: 0, functionType: "$_id", data: 1 } },
  ];

  return await OpenAIFunctionDefinitionModel.aggregate(aggregationPipeline);
}

// export async function getDistinctFunctionTypes(): Promise<string[]> {
//   return await OpenAIFunctionDefinitionModel.distinct("functionType");
// }
