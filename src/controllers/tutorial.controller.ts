import { Request, Response } from "express";
import { sendResponse } from "../utils/response.utils";
import { findTutorialDocuments } from "../services/tutorial.services";

export async function getTutorialController(req: Request, res: Response) {
    const topicList = await findTutorialDocuments({});
    return sendResponse(res, 200, "success", topicList);
}
