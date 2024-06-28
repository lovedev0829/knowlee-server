import { FilterQuery, ProjectionType, QueryOptions } from "mongoose";
import OneDriveScraped, {
  IOneDriveScraped,
} from "../models/scrap/OneDriveScraped.model";
import { CreateOptions } from "mongoose";

export async function createOneDriveScrapedDocument(
  doc: Partial<IOneDriveScraped>
) {
  return await OneDriveScraped.create(doc);
}

export const findOneOneDriveScrapedDocument = async (
  filter?: FilterQuery<IOneDriveScraped>,
  projection?: ProjectionType<IOneDriveScraped>,
  options?: QueryOptions<IOneDriveScraped>
) => {
  return await OneDriveScraped.findOne(filter, projection, options);
};

// session is not supported for create one document
export async function createOneDriveScrapedDocuments(
  docs: Array<Partial<IOneDriveScraped>>,
  options?: CreateOptions
) {
  return await OneDriveScraped.create(docs, options);
}
