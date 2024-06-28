import { Request, Response } from "express";
import { ConversationModel, IConversation } from "../models/conversation.model";
import { sendResponse } from "../utils/response.utils";
import { RequestError } from "../utils/globalErrorHandler";

// Create a new conversation
export const createConversation = async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    const newConversation = new ConversationModel({ title, user: req.user });
    const savedConversation = await newConversation.save();
    return sendResponse(res, 201, "", savedConversation);
  } catch (error) {
    throw new RequestError("Failed to create conversation", 500);
  }
};

// Get all Conversations
export const getAllConversations = async (req: Request, res: Response) => {
  try {
    const conversations = await ConversationModel.find({ user: req.user })
      .sort({ createdAt: -1 });
    return sendResponse(res, 200, "", conversations);
  } catch (error) {
    throw new RequestError("Failed to fetch conversations", 500);
  }
};

// Get conversation by ID
export const getConversationById = async (req: Request, res: Response) => {
  try {
    const conversationId = req.params.id;
    const { populate: populateList }: { populate?: string | string[] } = req.query
    const conversationQuery = ConversationModel.findOne({ _id: conversationId })
      .where('isDeleted').ne(true)
    if (populateList) {
      conversationQuery.populate(populateList);
    }
    const conversation = await conversationQuery;
    if (!conversation) {
      return sendResponse(res, 404, "Conversation not found");
    }
    return sendResponse(res, 200, "", conversation);
  } catch (error) {
    throw new RequestError("Failed to fetch conversation", 500);
  }
};

// Update conversation by ID
export const updateConversationById = async (req: Request, res: Response) => {
  try {
    const conversationId = req.params.id;
    const updatedConversation = await ConversationModel.findByIdAndUpdate(
      conversationId,
      req.body
    );
    if (!updatedConversation) {
      return sendResponse(res, 404, "Conversation not found");
    }
    return sendResponse(res, 200, "", updatedConversation);
  } catch (error) {
    throw new RequestError("Failed to update conversation", 500);
  }
};

// Delete conversation by ID
export const deleteConversationById = async (req: Request, res: Response) => {
  try {
    const conversationId = req.params.id;
    const conversation: IConversation | null = await ConversationModel.findById(conversationId);
    if (!conversation) return sendResponse(res, 404, "Conversation not found");
    const deletedConversation = await conversation.deleteOne();
    if (!deletedConversation) {
      return sendResponse(res, 404, "Conversation not found");
    }
    return sendResponse(res, 200, "Conversation deleted successfully", deletedConversation);
  } catch (error) {
    throw new RequestError("Failed to delete conversation");
  }
};
