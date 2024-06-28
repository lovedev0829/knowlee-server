import { Request, Response } from "express";
import { sendResponse } from "../utils/response.utils";
import { findFunctionDefinitionDocuments, findFunctionDefinitionDocumentsWithGrouping } from "../services/knowlee-agent/functionDefinition.services";
import { RequestError } from "../utils/globalErrorHandler";
import { FilterQuery } from "mongoose";
import { IOpenAIFunctionDefinition } from "../models/openai/OpenAIFunctionDefinition.model";

export const getAvailableFunctionDefinitionController = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) throw new RequestError("Could not verify user", 401);
    const { isSuperAdmin = false } = user;
    const filter: FilterQuery<IOpenAIFunctionDefinition> = {};
    if (!isSuperAdmin) {
        filter.onlySuperAdmin = { $ne: true }
    }
    const functionList = await findFunctionDefinitionDocuments(filter);
    return sendResponse(res, 200, "success", functionList);
};

export const getAvailableFunctionDefinitionWithGroupingController = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) throw new RequestError("Could not verify user", 401);
    const { isSuperAdmin = false } = user;
    const filter: FilterQuery<IOpenAIFunctionDefinition> = {};
    if (!isSuperAdmin) {
        filter.onlySuperAdmin = { $ne: true }
    }
    const functionList = await findFunctionDefinitionDocumentsWithGrouping(filter);

    // Sort the functionList by functionType
    const sortedFunctionList = functionList.sort((a, b) => {
        if (a.functionType < b.functionType) return -1;
        if (a.functionType > b.functionType) return 1;
        return 0;
    });

    return sendResponse(res, 200, "success", sortedFunctionList);
};
