import { CreateOptions, FilterQuery, ProjectionType, QueryOptions, UpdateQuery } from "mongoose";
import ContentModel, {
    ContentFormat,
    IContentDocument,
} from "../models/content-creation/Content.model";
import { openAICreateChatCompletion } from "./openAI.services";

export async function createContent(topic: string, contentFormat: ContentFormat) {
    let prompt;
    switch (contentFormat) {
        case "tweet":
            prompt = `Craft a tweet that evoke the wonder and creativity unlocked by Knowlee's Text-to-Image feature. Focus on the emotional journey of seeing one's thoughts and ideas visually represented for the first time. Highlight the magic of turning the invisible into the visible, the joy of creation, and the personal connection users can achieve through this innovative tool. Use vivid imagery and aspirational language to capture the limitless possibilities opened by merging human creativity with AI's capabilities. Encourage sharing of personal dreams, ideas, and the excitement of bringing them to life visually. Incorporate a mix of hashtags that reflect innovation, the power of AI, and the emotional journey of creation. Use maximum 280 characters.`;
            break;

        case "thread":
            prompt = `Develop a series of interconnected messages or posts diving deep into the topic: ${topic}. Start with a compelling hook to grab attention in the first message. Ensure each subsequent message builds upon the last, weaving a narrative that provides a comprehensive exploration of the topic. To separate each tweet do not make bullet points but use the delimiter '|||', indicating where one ends and the next begins. The thread should engage the audience, offer insightful analysis, and encourage further discussion`;
            break;

        case "article":
            prompt = `Compose a detailed and informative article about the topic: ${topic}. Aim for a length suitable for a blog post.`;
            break;

        case "email":
            prompt = `Write a professional email addressing the subject: ${topic}. Make it engaging and actionable for the recipient.`;
            break;

        case "post":
            prompt = `Construct a social media post focusing on the essence of ${topic}. It should resonate with a broad audience.`;
            break;

        default:
            prompt = topic;
            break;
    }

    const completion = await openAICreateChatCompletion({
        messages: [
            {
                role: "system",
                content: "Strictly provide answers in markdown format and use maximum 280 characters. could be broadened to reach a wider audience interested in creativity, innovation, or AI technology, which might better align with the goal of conveying the tool's broader impact ",
            },
            {
                role: "user",
                content: prompt,
            },
        ],
    });

    return completion;
}

export async function createContentDocument(doc: Partial<IContentDocument>) {
    return await ContentModel.create(doc);
}

export async function createContentDocuments(
    docs: Array<Partial<IContentDocument>>,
    options?: CreateOptions
) {
    return await ContentModel.create(docs, options);
}

export async function findContentDocument(
    filter: FilterQuery<IContentDocument>,
    projection?: ProjectionType<IContentDocument>,
    options?: QueryOptions<IContentDocument>
) {
    return await ContentModel.find(filter, projection, options);
}

export const findOneContentDocument = async (
    filter?: FilterQuery<IContentDocument>,
    projection?: ProjectionType<IContentDocument>,
    options?: QueryOptions<IContentDocument>
) => {
    return await ContentModel.findOne(filter, projection, options);
};

export const findByIdContentDocument = async (
    id: any,
    projection?: ProjectionType<IContentDocument>,
    options?: QueryOptions<IContentDocument>
) => {
    return await ContentModel.findById(id, projection, options);
};

export function getSystemPromptForImprovement(action: string) {
    switch (action) {
        case "MAKE_SHORTER":
            return "Make the following content shorter. Reduce the length without impacting the overall undertanding. Provide only the reduce content in your reply";

        case "EXPAND":
            return "Provide a more detailed version of the following content";

        case "IMPROVE":
            return "Enhance the following content for better clarity and impact";

        case "REPHRASE":
            return "Rephrase the following content to express the same message in a different way";

        case "ADD_EMOJIS":
            return "Suggest appropriate emojis to enhance the following content's tone and message";

        case "REMOVE_EMOJIS":
            return "removes emojis from the following content";

        default:
            return "";
    }
}

export const findByIdAndUpdateContentDocument = async (
    id: string,
    update: UpdateQuery<IContentDocument>,
    options?: QueryOptions<IContentDocument>
) => {
    return await ContentModel.findByIdAndUpdate(id, update, options);
};
