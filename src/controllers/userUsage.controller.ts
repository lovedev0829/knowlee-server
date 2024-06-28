import { Request, Response } from "express";
import { sendResponse } from "../utils/response.utils";

import { RequestError } from "../utils/globalErrorHandler";
import {
  createUserUsageStat,
  findOneUserUsageStatDocument
} from "../services/userUsageStat.services";

export const getUserUsageController = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new RequestError("userId is required", 400);
  const userId = user?.id || "";

  if (!userId) throw new RequestError("userId is required", 400);

  let userUsage = await findOneUserUsageStatDocument(
    { userId: userId },
    {},
    { lean: true }
  );
  if (!userUsage) {
    userUsage = await createUserUsageStat({ userId: userId });
  }
  return sendResponse(res, 200, "", userUsage);
};