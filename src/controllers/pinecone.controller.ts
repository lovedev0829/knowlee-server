import { Request, Response } from "express";
import { upsertPinconeVector } from "../services/pinecone.services";
import { sendResponse } from "../utils/response.utils";
import { RequestError } from "../utils/globalErrorHandler";

// upsert vector to pinecone
export const upsertVectorToPinecone = async (req: Request, res: Response) => {
  if (!req.user) throw new RequestError("Could not verify user", 401);
  const { embedText, metadata } = req.body;
  const namespace = req.user.id;
  if (!embedText) return sendResponse(res, 400, 'embedText is required');
  try {
    const result = await upsertPinconeVector({ embedText, metadata, namespace });
    return sendResponse(res, 200, "Vector upserted successfully", result);
  } catch (error) {
    throw new RequestError("Failed to upsert pinecone vector", 500);
  }
};
