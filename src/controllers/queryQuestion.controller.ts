import { Request, Response } from "express";
import { QueryQuestionModel } from "../models/queryQuestion.model";
import { sendResponse } from "../utils/response.utils";
import { RequestError } from "../utils/globalErrorHandler";

// Create a new question
export const createQuestion = async (req: Request, res: Response) => {
  try {
    const { question, answer } = req.body;
    const newQuestion = new QueryQuestionModel({ question, answer });
    const savedQuestion = await newQuestion.save();
    return sendResponse(res, 201, "", savedQuestion);
  } catch (error) {
    throw new RequestError("Failed to create question", 500);
  }
};

// Get all questions
export const getAllQuestions = async (req: Request, res: Response) => {
  try {
    const questions = await QueryQuestionModel.find();
    return sendResponse(res, 200, "", questions);
  } catch (error) {
    throw new RequestError("Failed to fetch questions", 500);
  }
};

// Get question by conversation ID
export const getQuestionByConversationId = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const question = await QueryQuestionModel.findById(conversationId);
    if (!question) {
      return sendResponse(res, 404, "Question not found");
    }
    return sendResponse(res, 200, "", question);
  } catch (error) {
    throw new RequestError("Failed to fetch question", 500);
  }
};

// Get question by ID
export const getQuestionById = async (req: Request, res: Response) => {
  try {
    const questionId = req.params.id;
    const question = await QueryQuestionModel.findById(questionId);
    if (!question) {
      return sendResponse(res, 404, "Question not found");
    }
    return sendResponse(res, 200, "", question);
  } catch (error) {
    throw new RequestError("Failed to fetch question", 500);
  }
};

// Update question by ID
export const updateQuestionById = async (req: Request, res: Response) => {
  try {
    const questionId = req.params.id;
    const updatedQuestion = await QueryQuestionModel.findByIdAndUpdate(
      questionId,
      req.body,
      {
        new: true,
      }
    );
    if (!updatedQuestion) {
      return sendResponse(res, 404, "Question not found");
    }
    return sendResponse(res, 200, "", updatedQuestion);
  } catch (error) {
    throw new RequestError("Failed to update question", 500);
  }
};

// Delete question by ID
export const deleteQuestionById = async (req: Request, res: Response) => {
  try {
    const questionId = req.params.id;
    const deletedQuestion = await QueryQuestionModel.findByIdAndDelete(
      questionId
    );
    if (!deletedQuestion) {
      return sendResponse(res, 404, "Question not found");
    }
    return sendResponse(res, 200, "Question deleted successfully", deletedQuestion);
  } catch (error) {
    throw new RequestError("Failed to delte question", 500);
  }
};
