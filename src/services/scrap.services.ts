import { IEntity } from "../models/entity.model";
import GoogleHeadlineModel from "../models/scrap/GoogleHeadline.model";
import MediumModel from "../models/scrap/Medium.model";
import CODAModel from "../models/scrap/Coda.model";
import PDFModel from "../models/scrap/PDF.model";
import ThreadModel from "../models/scrap/Thread.model";
import TweetModel from "../models/scrap/Tweet.model";
import URLModel from "../models/scrap/URL.model";
import RedditModel from "../models/scrap/Reddit.model";
import YouTubeModel from "../models/scrap/YouTube.model";
import GitbookModel from "../models/scrap/Gitbook.model";
import OpenAIModel from "../models/scrap/OpenAI.model";
import GithubModel from "../models/scrap/Github.model";
import BubblemapsModel from "../models/scrap/Bubblemaps.model";
import { findOneCarbonScrapedDocument } from "./carbonScraped.service";
import { findOneGoogleDriveScrapedDocument } from "./googleDriveScraped.service";
import { findOneOneDriveScrapedDocument } from "./oneDriveScraped.service";
import LinkedInJobModel from "../models/scrap/LinkedInJob.model";

export async function saveScrapedDataToMongoDB(
    {
        sourceType,
        subSetType,
    }: {
        sourceType: string;
        subSetType: string;
    },
    items: unknown[]
) {
    switch (sourceType) {
        case "youtube":
            if (subSetType === "video") {
                return await YouTubeModel.insertMany(items);
            }

        case "twitter":
            if (subSetType === "tweet") {
                return await TweetModel.insertMany(items);
            }
            if (subSetType === "thread") {
                return await ThreadModel.insertMany(items);
            }

        case "medium":
            if (subSetType === "article") {
                return await MediumModel.insertMany(items);
            }

        case "coda":
            if (subSetType === "url") {
                return await CODAModel.insertMany(items);
            }

        case "news":
            if (subSetType === "url") {
                return await GoogleHeadlineModel.insertMany(items);
            }

        case "pdf":
            if (subSetType === "url") {
                return await PDFModel.insertMany(items);
            }

        case "url":
            if (subSetType === "url") {
                return await URLModel.insertMany(items);
            }

        case "reddit":
            if (subSetType === "url") {
                return await RedditModel.insertMany(items);
            }
        
        case "openai":
            if (subSetType === "url") {
                return await OpenAIModel.insertMany(items);
            }

        case "linkedin": {
            if (subSetType === "url") {
                return await LinkedInJobModel.insertMany(items);
            }
        }
        default:
            return [];
    }
}

export async function updateScrapedDataDocumentById(
    entity: IEntity,
    scrapedDataId: string,
    update: any
) {
    let { sourceType, subSetType } = entity;
    sourceType = sourceType.toLowerCase();
    subSetType = subSetType.toLowerCase();

    switch (sourceType) {
        case "youtube":
            if (subSetType === "video") {
                return await YouTubeModel.findByIdAndUpdate(scrapedDataId, update);
            }

        case "twitter":
            if (subSetType === "tweet") {
                return await TweetModel.findByIdAndUpdate(scrapedDataId, update);
            }
            if (subSetType === "thread") {
                return await ThreadModel.findByIdAndUpdate(scrapedDataId, update);
            }

        case "medium":
            if (subSetType === "article") {
                return await MediumModel.findByIdAndUpdate(scrapedDataId, update);
            }

        case "news":
            if (subSetType === "url") {
                return await GoogleHeadlineModel.findByIdAndUpdate(
                    scrapedDataId,
                    update
                );
            }

        case "coda":
            if (subSetType === "url") {
                return await CODAModel.findByIdAndUpdate(
                    scrapedDataId,
                    update
                );
            }
    
        case "pdf":
            if (subSetType === "url") {
                return await PDFModel.findByIdAndUpdate(scrapedDataId, update);
            }

        case "reddit":
            if (subSetType === "url") {
                return await RedditModel.findByIdAndUpdate(scrapedDataId, update);
            }
       
        case "openai":
            if (subSetType === "url") {
                return await OpenAIModel.findByIdAndUpdate(scrapedDataId, update);
            }

        default:
            return;
    }
}

export async function getScrapedDataByEntity(entity: IEntity, options = {
    limit: 10,
    skip: 0
}) {
    const { sourceType, subSetType, value, id: entityId } = entity;
    switch (sourceType) {
        case "carbon": {
            return await findOneCarbonScrapedDocument({
                entityId: entityId
            });
        }

        case "google_drive": {
            return await findOneGoogleDriveScrapedDocument({
                entityId: entityId,
            });
        }

        case "medium":
            if (subSetType === "article") {
                return await MediumModel.findOne({
                    $or: [{ url: value }, { links: value }, { entityId: entityId }],
                });
            }

        case "news":
            if (subSetType === "url") {
                return await GoogleHeadlineModel.findOne({
                    $or: [{ link: value }, { entityId: entityId }],
                });
            }

        case "microsoft_onedrive": {
            return await findOneOneDriveScrapedDocument({
                entityId: entityId,
            });
        }

        case "coda":
            if (subSetType === "url") {
                return await CODAModel.findOne({
                    $or: [{ link: value }, { entityId: entityId }],
                });
            }
    
        case "pdf":
            if (subSetType === "url") {
                return await PDFModel.findOne({
                    $or: [{ url: value }, { entityId: entityId }],
                });
            }

        case "twitter":
            if (subSetType === "tweet") {
                return await TweetModel.findOne({
                    $or: [{ url: value }, { entityId: entityId }],
                });
            }
            if (subSetType === "thread") {
                return await ThreadModel.findOne({
                    $or: [{ url: value }, { entityId: entityId }],
                });
            }

        case "url":
            if (subSetType === "url") {
                return await URLModel.findOne({
                    $or: [{ url: value }, { links: value }, { entityId: entityId }],
                });
            }

        case "youtube":
            if (subSetType === "video") {
                return await YouTubeModel.findOne({
                    $or: [{ url: value }, { entityId: entityId }],
                });
            }

        case "reddit":
            if (subSetType === "url") {
                return await RedditModel.findOne({
                    $or: [{ url: value }, { entityId: entityId }],
                });
            }
            case "gitbook":
                if(subSetType === "url") {
                    return await GitbookModel.findOne({
                        $or: [{ url: value }, { entityId: entityId }],
                    });
                }        
        case "openai":
            if (subSetType === "url") {
                return await OpenAIModel.findOne({
                    $or: [{ url: value }, { entityId: entityId }],
                });
            }
      
        case "github":
            if (subSetType === "url") {
                return await GithubModel.findOne({
                    $or: [{ url: value }, { entityId: entityId }],
                });
                // getGithubScrapedDataByEntityWithPagination()
                // const { skip, limit } = options
                // const content = await GithubModel.aggregate([
                //     { $match: { $or: [{ url: value }, { entityId: entityId }]} },
                //     {
                //       $project: {
                //         content: 1,
                //         totalNestedCount: { $size: "$content" }
                //       }
                //     },
                //     { $unwind: "$content" },
                //     { $skip: skip },
                //     { $limit: limit },
                //     {
                //       $project: {
                //         totalFiles: "$totalNestedCount",
                //         file: "$content",
                //       }
                //     }
                //   ]); 

                //   const pagination = {
                //     ...data,
                //     content,
                //     skip,
                //     limit
                //   }

                // return data
            }

            case "bubblemaps":
                    return await BubblemapsModel.findOne({
                        $or: [{ url: value }, { entityId: entityId }],
                    });

        case "linkedin":
            if (subSetType === "url") {
                return await LinkedInJobModel.findOne({
                    $or: [{ entityId: entityId }],
                });
            }
            
        default:
            // console.log(`case for sourceType - ${sourceType} is not defined in getScrapedDataByEntity`);
            return null;
    }
}


export const getGithubScrapedDataByEntityWithPagination = async (
  entity: IEntity,
  options = {
    limit: 10,
    skip: 0,
  }
) => {
  const { sourceType, subSetType, value, id: entityId } = entity;

  const data = await GithubModel.findOne(
    {
      $or: [{ url: value }, { entityId: entityId }],
    },
    { content: 0 },
    { lean: true }
  );
  const { skip, limit } = options;
  const content = await GithubModel.aggregate([
    { $match: { $or: [{ url: value }, { entityId: entityId }] } },
    {
      $project: {
        content: 1,
        totalNestedCount: { $size: "$content" },
      },
    },
    { $unwind: "$content" },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        total: "$totalNestedCount",
        file: "$content",
      },
    },
  ]);

  const pagination = {
    ...data,
    content,
    skip,
    limit,
  };
  return pagination;
};