import { FilterQuery, QueryOptions, Types } from "mongoose";
import {
    QueryQuestionModel,
    IQueryQuestion,
} from "../models/queryQuestion.model";

export const createNewQueryQuestion = async (
    doc: Partial<IQueryQuestion>
): Promise<IQueryQuestion> => {
    const newQQ = new QueryQuestionModel(doc);
    await newQQ.save();
    return newQQ;
};

export const updateQueryQuestion = async (id: Types.ObjectId, updates: Partial<IQueryQuestion>): Promise<IQueryQuestion | undefined> => {
    const qq = await QueryQuestionModel.findById(id)
    if (!qq) {
        console.error('Conversation not found');
        return
    }
    qq.set(updates)
    await qq.save();
    return qq
}

export const deleteManyQueryQuestion = async (
    filter?: FilterQuery<IQueryQuestion>,
    options?: QueryOptions<IQueryQuestion>
) => {
    return await QueryQuestionModel.deleteMany(filter, options);
};
