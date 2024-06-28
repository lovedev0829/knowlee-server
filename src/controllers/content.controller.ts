import { Request, Response } from "express";
import {
    createContent,
    createContentDocuments,
    findByIdAndUpdateContentDocument,
    findByIdContentDocument,
    findContentDocument,
    getSystemPromptForImprovement,
} from "../services/content.services";
import { RequestError } from "../utils/globalErrorHandler";
import { sendResponse } from "../utils/response.utils";
import { createOneTopicDocument } from "../services/topic.services";
import {
    ContentFormat,
    IContentDocument,
} from "../models/content-creation/Content.model";
import { FilterQuery, UpdateQuery } from "mongoose";
import { ChatCompletion } from "openai/resources";
import { openAICreateChatCompletion } from "../services/openAI.services";
import { checkUserTokenUsage } from "../utils/openAITokenUsage";
import { findOneAndUpdateUserUsageStatDocument } from "../services/userUsageStat.services";
import { agendaCancel, agendaSchedule, SCHEDULE_CONTENT_POST } from "../lib/agenda.services";
import * as mongodb from "mongodb";
import { findOneStatsPriceDocument } from "../services/stripe/statsPrice.services";
import { IUserUsageStat } from "../models/UserUsageStat.model";

export const getAllCreatedContent = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new RequestError("User ID is required", 400);

    const filter: FilterQuery<IContentDocument> = { userId: userId };
    const { topicId } = req.query;
    if (topicId) {
        filter.topicId = topicId;
    }
    const contentList = await findContentDocument(filter);
    return sendResponse(res, 201, "success", contentList);
};

export const generateContentController = async (
    req: Request,
    res: Response
) => {
    const user = req.user;
    if (!user) throw new RequestError("Could not verify user", 401);

    const { topic } = req.body;
    if (!topic) throw new RequestError("topic is required", 400);
    const { contentFormats, generatedFrom, topicTitle, userId } = topic;
    if (!contentFormats || !contentFormats.length)
        throw new RequestError("contentFormats is required and should not be empty", 400);
    if (!generatedFrom) throw new RequestError("generatedFrom is required", 400);
    if (!topicTitle) throw new RequestError("topicTitle is required", 400);
    if (!userId) throw new RequestError("User ID is required", 400);

    // save topic document
    const topicDocument = await createOneTopicDocument({
        contentFormats,
        userId,
        topicTitle,
        generatedFrom,
    });

    const createContentResponsePromises: Promise<ChatCompletion>[] =
        contentFormats.map((contentFormat: ContentFormat) => {
            return createContent(topicTitle, contentFormat);
        });

    const createContentResponseList = await Promise.all(
        createContentResponsePromises
    );


    let sumOfTotalTokens = 0;
    const contentList = createContentResponseList.map((completion, index) => {
        const contentData = completion.choices[0]?.message?.content;

        // token usage calculation
        const total_tokens = completion.usage?.total_tokens ?? 0;
        sumOfTotalTokens += total_tokens;

        if (!contentData) throw new Error("ChatGPT response failed.");
        //console.log("contentData----->", contentData);
        const content: Partial<IContentDocument> = {
            contentData: contentData,
            contentFormat: contentFormats[index],
            contentTitle: topicTitle,
            topicId: topicDocument._id,
            userId: userId,
        };
        return content;
    });

    const updateObject: UpdateQuery<IUserUsageStat> = { $inc: {} };
    updateObject.$inc["tokenUsed"] = sumOfTotalTokens || 0;
    if (req?.useCredit) {
        // find stats price document
        const statsPrice = await findOneStatsPriceDocument({});
        const { unitCost = 0, perUnit = 1 } = statsPrice?.features?.tokens || {};
        const creditUsed = (unitCost / perUnit) * sumOfTotalTokens;
        updateObject.$inc["credit.used"] = creditUsed || 0;
    }

    // update user token usage
    const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
        { userId: user.id },
        updateObject,
        { upsert: true, new: true }
    );

    const newContentList = await createContentDocuments(contentList);
    return sendResponse(res, 201, "success", newContentList);
};

export const improveCreatedContentController = async (req: Request, res: Response) => {
    const user = req.user
    if (!user) throw new RequestError("Could not verify user", 401);
    const { action, createdContentId } = req.body;
    if (!action) throw new RequestError("action is required", 400);
    if (!createdContentId) throw new RequestError("createdContentId is required", 400);

    await checkUserTokenUsage(user.id);

    const createdContent = await findByIdContentDocument(createdContentId);
    if (!createdContent) throw new RequestError("content not found", 404);

    const systemContent = getSystemPromptForImprovement(action);
    const completion = await openAICreateChatCompletion({
        messages: [
            {
                role: "system",
                content: systemContent,
            },
            {
                role: "user",
                content: createdContent.contentData,
            },
        ],
    });
    // update user token usage
    const total_tokens = completion.usage?.total_tokens ?? 0;
    
    const updateObject: UpdateQuery<IUserUsageStat> = { $inc: {} };
    updateObject.$inc["tokenUsed"] = total_tokens || 0;
    if (req?.useCredit) {
        // find stats price document
        const statsPrice = await findOneStatsPriceDocument({});
        const { unitCost = 0, perUnit = 1 } = statsPrice?.features?.tokens || {};
        const creditUsed = (unitCost / perUnit) * total_tokens;
        updateObject.$inc["credit.used"] = creditUsed || 0;
    }

    const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
        { userId: user.id },
        updateObject,
        { upsert: true, new: true }
    );

    const improvedContent = completion.choices[0]?.message?.content;
    if (!improvedContent) throw new Error("ChatGPT response failed.");

    createdContent.contentData = improvedContent;
    await createdContent.save();

    return sendResponse(res, 200, "success", createdContent);
};

export const scheduleContentController = async (
    req: Request,
    res: Response
) => {
    const user = req.user;
    if (!user) throw new RequestError("Could not verify user", 401);
    const { id } = req.params;
    const { scheduledAt } = req.body;
    // console.log("scheduledAt----->", scheduledAt);

    const contentDocument = await findByIdContentDocument(id);

    if (!contentDocument) {
        throw new RequestError("Created Content not found", 404);
    }

    if (contentDocument.jobId) {
        // cancel previous job
        // console.log("contentDocument.jobId----->", contentDocument.jobId);
        await agendaCancel({ "_id": new mongodb.ObjectId(contentDocument.jobId.toString()) });
    }

    //  schedule agenda job to post content
    const job = await agendaSchedule(scheduledAt, SCHEDULE_CONTENT_POST, { content: contentDocument });
    // console.log("New job scheduled ", job.attrs._id);

    // update schedule time
    const updatedContent = await findByIdAndUpdateContentDocument(
        id,
        {
            scheduledAt: scheduledAt,
            jobId: job.attrs._id,
        },
        { new: true }
    );
    return sendResponse(res, 200, "Content Scheduled", updatedContent);
};
