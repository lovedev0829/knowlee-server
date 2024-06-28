import { FilterQuery, ProjectionType, QueryOptions } from "mongoose";
import GoogleDriveScraped, {
  IGoogleDriveScraped,
} from "../models/scrap/GoogleDriveScraped.model";

export async function createGoogleDriveScrapedDocument(
  doc: Partial<IGoogleDriveScraped>
) {
  return await GoogleDriveScraped.create(doc);
}

export const findOneGoogleDriveScrapedDocument = async (
  filter?: FilterQuery<IGoogleDriveScraped>,
  projection?: ProjectionType<IGoogleDriveScraped>,
  options?: QueryOptions<IGoogleDriveScraped>
) => {
  return await GoogleDriveScraped.findOne(filter, projection, options);
};
