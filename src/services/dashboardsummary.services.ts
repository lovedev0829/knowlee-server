import { ClientSession, FilterQuery, ProjectionType, QueryOptions, UpdateQuery } from "mongoose";
import { DashboardsummaryModel, IDashboardSummary } from "../models/dashboardsummary.model";
import { EntityModel, IEntity } from "../models/entity.model";
import { UserKnowledgeModel } from "../models/userKnowledge.model";
import MediumModel from "../models/scrap/Medium.model";
import GoogleHeadlineModel from "../models/scrap/GoogleHeadline.model";
import RedditModel from "../models/scrap/Reddit.model";
import YouTubeModel from "../models/scrap/YouTube.model";
import OpenAIModel from "../models/scrap/OpenAI.model";

export const findOneDashboardSummary = async (
    filter?: FilterQuery<IDashboardSummary>,
    projection?: ProjectionType<IDashboardSummary>,
    options?: QueryOptions<IDashboardSummary>
) => {
    return await DashboardsummaryModel.findOne(filter, projection, options);
};

export const getRecentActivity = async (userId: string, session?: ClientSession) => {
    var userKnowledge = await UserKnowledgeModel.find(
        { userId: userId }
    );
    let query = { id: { $in: userKnowledge[0].entities } }
    let result = await EntityModel.find(query).sort({ 'createdAt': 'desc' }).limit(3);
    return result;
};


export const deleteManyDashboardSummaries = async (
    filter?: FilterQuery<IDashboardSummary>,
    options?: QueryOptions<IDashboardSummary>
) => {
    return await DashboardsummaryModel.deleteMany(filter, options);
};


export const findOneAndUpdateDashboardSummary = async (
    filter?: FilterQuery<IDashboardSummary>,
    update?: UpdateQuery<IDashboardSummary>,
    options?: QueryOptions<IDashboardSummary>
) => {
    return await DashboardsummaryModel.findOneAndUpdate(filter, update, options);
};


export async function getTitleForDashboardSummary(entity: IEntity) {
    const { id: entityId, sourceType, subSetType, value } = entity;
    let data;
    switch (sourceType) {
        case "medium":
            if (subSetType === "article") {
                data = await MediumModel.findOne({
                    $or: [{ url: value }, { links: value }, { entityId: entityId }],
                });
                if (!data) return "";
                return data.title;
            }

        case "news":
            if (subSetType === "url") {
                data = await GoogleHeadlineModel.findOne({
                    $or: [{ link: value }, { entityId: entityId }],
                });
                if (!data) return "";
                return data.title;
            }

        case "youtube":
            if (subSetType === "video") {
                data = await YouTubeModel.findOne({
                    $or: [{ url: value }, { entityId: entityId }],
                });
                if (!data) return "";
                return data.title;
            }
      
        case "reddit":
            if (subSetType === "url") {
                data = await RedditModel.findOne({
                    $or: [{ url: value }, { entityId: entityId }],
                });
                if (!data) return "";
                return data.title;
            }
       
        case "openai":
            if (subSetType === "url") {
                data = await OpenAIModel.findOne({
                    $or: [{ url: value }, { entityId: entityId }],
                });
                if (!data) return "";
                return data.metadata.title;
            }

        default:
            return "";
    }
}


export async function findDashboardsummary(
    filter: FilterQuery<IDashboardSummary>,
    projection?: ProjectionType<IDashboardSummary>,
    options?: QueryOptions<IDashboardSummary>
) {
    return DashboardsummaryModel.find(filter, projection, options);
}

export async function createOneDashboardSummary(doc: Partial<IDashboardSummary>) {
    return await DashboardsummaryModel.create(doc);
}