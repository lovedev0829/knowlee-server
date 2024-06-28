
import { Request, Response } from "express";
import { sendResponse } from "../utils/response.utils";
import { absoluteUrl } from "../lib/utils";

import {
  generateToken,
  validateToken,
  copyAssistantConfig
} from "../lib/shareAssistant.service";

//generate token to share AI assitant
export const generateAssistantUrl = async (req: Request, res: Response) => {

  const { userId, assistantId } = req.body; // Assume these are passed in the request
  const token = await generateToken({ userId, assistantId });
  const shareUrl = absoluteUrl(`/share?token=${token}`);  // Use absoluteUrl function

  return sendResponse(res, 200, "success", shareUrl);
}

//handle ai assistant
export const handleShareAssistant = async (req: Request, res: Response) => {

  const { token, newUserId } = req.query as { token: string, newUserId: string };

  const isValid = await validateToken(token);
  if (!isValid) {
    return res.status(400).send({ message: "Invalid or expired token." });
  }
  const success = await copyAssistantConfig(token, newUserId);

  if (success) {
    return sendResponse(res, 200, "success", "Assistant has been successfully shared.");
  } else {
    return sendResponse(res, 500, "Failed to share the assistant.");
  }
}