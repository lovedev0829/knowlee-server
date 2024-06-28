import { Request, Response } from "express";
import { sendResponse } from "../utils/response.utils";
import { RequestError } from "../utils/globalErrorHandler";
import { findArtemisInsights } from "../services/artemis/artemisInsight.services";
import { USER_SELECTION_ARTEMISID_MAP } from "../services/artemis/artemis.data";

export async function getCryptoInsightsController(req: Request, res: Response) {
  // const { formats } = req.body;

  const queryParams = req.query;
  const formats = queryParams.formats as string[];

  //console.log("formats----->", formats);

  if (!formats || !Array.isArray(formats)) {
    throw new RequestError("formats is required", 400);
  }

  const artemisIds: string[] = [];

  formats.forEach((userSelection) => {
    const ids = USER_SELECTION_ARTEMISID_MAP?.[userSelection];
    if (Array.isArray(ids) && ids.length) {
      artemisIds.push(...ids);
    }
  });

  // Calculate the date 24 hours ago
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 2400);

  const insights = await findArtemisInsights(
    {
      artemisId: { $in: artemisIds },
      createdAt: { $gte: twentyFourHoursAgo },
    },
    undefined,
    { sort: { createdAt: -1 } }
  );
  return sendResponse(res, 200, "success", { insights: insights });
}
