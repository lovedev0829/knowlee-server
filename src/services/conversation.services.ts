import { FilterQuery, QueryOptions, Types } from "mongoose";
import { Conversation, ConversationModel, IConversation } from "../models/conversation.model";
import { IQueryQuestion, QueryQuestionModel } from "../models/queryQuestion.model";
import { User } from "../models/user.model";
import { createNewQueryQuestion } from "./queryQuestion.services";


export const createNewConversation = async ({ question, answer }: { question: string, answer: string }, user: User): Promise<Conversation> => {

    // create new queryQuestion
    // const queryQuestion = await createNewQueryQuestion({ question, answer })
    // //console.log("new queryQuestion----->", queryQuestion)
    const newQQ = new QueryQuestionModel({ question, answer });

    // create new conversation with chatList
    const newConversation = new ConversationModel({ title: question, chatList: [newQQ], user: user });
    //console.log("newConversation id ----->", newConversation._id);
    newQQ.set("conversation", newConversation);

    const savedQQ = await newQQ.save();
    //console.log("savedQQ----->", savedQQ);
    const savedConversation = await newConversation.save();
    //console.log("new conversation----->", savedConversation);
    return savedConversation;

}

export const addNewQueryQuestionToConversation = async (
    conversationId: Types.ObjectId,
    queryQuestionDoc: Partial<IQueryQuestion>,
): Promise<Conversation | undefined> => {
    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) {
        console.error("Conversation not found");
        return;
    }

    const newQQ = await createNewQueryQuestion({
        ...queryQuestionDoc,
        conversation: conversationId,
    })

    conversation.chatList.push(newQQ._id);
    await conversation.save();
    return conversation;
};


export const deleteManyConversations = async (
    filter?: FilterQuery<IConversation>,
    options?: QueryOptions<IConversation>
) => {
    return await ConversationModel.deleteMany(filter, options);
};
