import { Request, Response } from "express";
import {
    createOneDashboardSummary,
    findOneDashboardSummary,
    getRecentActivity,
} from "../services/dashboardsummary.services";
import { sendResponse } from "../utils/response.utils";

import { ClientSession } from "mongoose";
import { RequestError } from "../utils/globalErrorHandler";

export const get = async (req: Request, res: Response) => {
    const session: ClientSession = req.session!;
    const { userId } = req.params;
    if (!userId) throw new RequestError('userId is required', 400);

    let dashboardSummary = await findOneDashboardSummary(
        { userId: userId },
        undefined,
        { session: session }
    );

    if (!dashboardSummary) {
      dashboardSummary = await createOneDashboardSummary({
        userId: userId,
        news: [],
      });
    }

    return sendResponse(res, 200, "", dashboardSummary);
};

export const getRecent = async (req: Request, res: Response) => {
    const session: ClientSession = req.session!;
    const { userId } = req.params;
    if (!userId) throw new RequestError('userId is required', 400);

    const recentactivity = await getRecentActivity(userId, session);
    if (!recentactivity) throw new RequestError('recentactivity does not exist', 404);

    return sendResponse(res, 200, "", recentactivity);
};