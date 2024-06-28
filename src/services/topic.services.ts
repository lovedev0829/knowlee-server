import {
    CreateOptions,
    FilterQuery,
    ProjectionType,
    QueryOptions,
} from "mongoose";
import TopicModel, {
    GeneratedFrom,
    ITopicDocument,
} from "../models/content-creation/Topic.model";
import { findOneDashboardSummary } from "./dashboardsummary.services";
import { openAICreateChatCompletion } from "./openAI.services";

export async function generateTopic(userId: string, topic?: string) {
    let prompt;
    let generatedFrom: GeneratedFrom;
    if (topic) {
        generatedFrom = "Custom";
        prompt = `Generate five engaging topics based on the following keywords or themes: ${topic}. Provide only the headlines.`;
    } else {
        // Retrieve titles from the dashboardsummary collection
        const summary = await findOneDashboardSummary({ userId: userId });
        if (summary && summary.news.length) {
            generatedFrom = "Dashboard";
            const userTitle = summary.news.map((s) => s.title).join(" ");
            prompt = `Based on the recent information from ${userTitle}, suggest five relevant and timely topics. Provide only the headlines.`;
        } else {
            generatedFrom = "Evergreen";
            prompt =
                "Based on the evergreen arguments, suggest five relevant topics. Provide only the headlines.";
        }
    }
    const completion = await openAICreateChatCompletion({
        messages: [
            {
                role: "system",
                content: "Strictly provide response in array of string.",
            },
            {
                role: "user",
                content: prompt,
            },
        ],
    });
    return { completion, generatedFrom };
}

export async function createTopicDocument(
    docs: Array<Partial<ITopicDocument>>,
    options?: CreateOptions
) {
    return await TopicModel.create(docs, options);
}

export async function createOneTopicDocument(
    doc: Partial<ITopicDocument>,
) {
    return await TopicModel.create(doc);
}

export async function findTopicDocument(
    filter: FilterQuery<ITopicDocument>,
    projection?: ProjectionType<ITopicDocument>,
    options?: QueryOptions<ITopicDocument>
) {
    return await TopicModel.find(filter, projection, options);
}
