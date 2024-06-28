import { Request, Response } from "express";
import { RequestError } from "../utils/globalErrorHandler";
import { sendResponse } from "../utils/response.utils";
import {
    // createTopicDocument,
    findTopicDocument,
    generateTopic,
} from "../services/topic.services";
import { findOneAndUpdateUserUsageStatDocument } from "../services/userUsageStat.services";
import { UpdateQuery } from "mongoose";
import { IUserUsageStat } from "../models/UserUsageStat.model";
import { findOneStatsPriceDocument } from "../services/stripe/statsPrice.services";

export const generateTopicController = async (req: Request, res: Response) => {
    const { topic, formats } = req.body;
    const user = req.user;
    if (!user) throw new RequestError("Could not verify user", 401);
    const userId = user.id;

    const generatedTopic = await generateTopic(userId, topic);
    const { generatedFrom, completion } = generatedTopic;

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
    const resultText = completion.choices[0]?.message?.content;
    if (!resultText) throw new Error("ChatGPT response failed.");

    const topicList: string[] = JSON.parse(resultText);
    //console.log("topicList ----->", topicList);
    //console.log("generatedFrom ----->", generatedFrom);
    const newTopics = topicList.map((t) => {
        return {
            contentFormats: formats,
            userId: userId,
            topicTitle: t,
            generatedFrom: generatedFrom,
        };
    });
    // const newTopicList = await createTopicDocument(newTopics);

    return sendResponse(res, 201, "success", newTopics);
};

export async function getAllGeneratedTopic(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) throw new RequestError("User ID is required", 400);
    const topicList = await findTopicDocument({ userId: userId });
    return sendResponse(res, 201, "success", topicList);
}
