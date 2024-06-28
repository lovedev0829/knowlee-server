import { Request, Response } from "express";
import { sendResponse } from "../utils/response.utils";
import { openAIAssistantsUpdate, openAIAssistantsRetrieve } from "../services/openAI.services";
import { findOneAndUpdateUserAgent, findUserAgentDocuments, deleteManyUserAgent } from "../services/knowlee-agent/agent.services";
import { RequestError } from "../utils/globalErrorHandler";

export const DEFAULT_MODEL = 'gpt-4o';
const BATCH_SIZE = 12;
const DELAY_MS = 60000 / 20; // 20 batches per minute

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function updateSpecificAgentModelController(req: Request, res: Response) {
    try {
        // Retrieve all user agents matching the query criteria
        const userAgents = await findUserAgentDocuments(
            { 
                "assistant.model": { "$regex": "gpt-4-" },
                "assistant.name": { "$ne": "Content" }
            },
            undefined,
            {}
        );

        if (!userAgents || userAgents.length === 0) {
            return sendResponse(res, 404, "error", { message: "No assistants found" });
        }

        let updatedCount = 0;
        let skippedCount = 0;
        let deletedCount = 0;

        // Process in batches
        for (let i = 0; i < userAgents.length; i += BATCH_SIZE) {
            const batch = userAgents.slice(i, i + BATCH_SIZE);

            const updatePromises = batch.map(async (agent) => {
                const assistantId = agent.assistant.id;

                try {
                    // Check if the assistant exists on OpenAI
                    await openAIAssistantsRetrieve(assistantId);

                    // Update the assistant to use GPT-4o model
                    await openAIAssistantsUpdate(assistantId, { model: DEFAULT_MODEL });

                    // Update the user agent in the database
                    await findOneAndUpdateUserAgent(
                        { "assistant.id": assistantId },
                        { $set: { "assistant.model": DEFAULT_MODEL } }
                    );

                    return { assistantId, status: 'updated' };
                } catch (error) {
                    if (error instanceof Error && error.message.includes('not found')) {
                        // Delete the user agent if not found on OpenAI
                        await deleteManyUserAgent({ "assistant.id": assistantId });
                        deletedCount++;
                    } else {
                        console.error(`Error updating assistant with ID ${assistantId}:`, error);
                        skippedCount++;
                    }
                    return { assistantId, status: 'skipped' };
                }
            });

            const results = await Promise.allSettled(updatePromises);

            updatedCount += results.filter(result => result.status === 'fulfilled' && result.value.status === 'updated').length;
            skippedCount += results.filter(result => result.status === 'fulfilled' && result.value.status === 'skipped').length;

            // Delay between batches
            if (i + BATCH_SIZE < userAgents.length) {
                await delay(DELAY_MS);
            }
        }

        return sendResponse(res, 200, "success", {
            message: `All assistants processed. ${updatedCount} updated, ${skippedCount} skipped, ${deletedCount} deleted.`,
        });

    } catch (error: unknown) {
        console.error("Error updating the agents:", error);

        if (error instanceof RequestError) {
            return sendResponse(res, error.statusCode, "error", { message: error.message });
        }

        return sendResponse(res, 500, "error", { message: "An unexpected error occurred while updating the agents" });
    }
}
