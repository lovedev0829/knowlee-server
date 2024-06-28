import { Request, Response } from "express";
import { UserKnowledgeModel } from "../models/userKnowledge.model";
import { RequestError } from "../utils/globalErrorHandler";
import { sendResponse } from "../utils/response.utils";
import { createUserKnowledge } from "../services/userKnowledge.services";


export const get = async (req: Request, res: Response) => {
  ////console.log('getting user knwoledge')
  const { userId } = req.params;
  if (!userId) throw new RequestError('userId field is required', 400);

  let userKnowledge = await UserKnowledgeModel.findOne({ userId });
  if (!userKnowledge) {
    userKnowledge = await createUserKnowledge({ userId, entities: [] });
  }

  return sendResponse(res, 200, "", userKnowledge);
};



