import { FilterQuery, ProjectionType, QueryOptions } from "mongoose";
import CarbonScraped, {
  ICarbonScraped,
} from "../models/scrap/CarbonScraped.model";

export async function createCarbonScrapedDocument(
  doc: Partial<ICarbonScraped>
) {
  return await CarbonScraped.create(doc);
}

export const findOneCarbonScrapedDocument = async (
  filter?: FilterQuery<ICarbonScraped>,
  projection?: ProjectionType<ICarbonScraped>,
  options?: QueryOptions<ICarbonScraped>
) => {
  return await CarbonScraped.findOne(filter, projection, options);
};
