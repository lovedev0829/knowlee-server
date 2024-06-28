import { ChatCompletionContentPart } from "openai/resources";
import { User } from "../../../models/user.model";
import { openAIGPT4VChatCompletionsCreate } from "../../openAI.services";
import { checkUserTokenUsage } from "../../../utils/openAITokenUsage";
import { findOneAndUpdateUserUsageStatDocument } from "../../userUsageStat.services";

export async function imageInterpreterFunction({
    user,
    prompt,
    image_url,
}: {
    user: User;
    prompt: string;
    image_url: string;
}) {
    try {
        if (!user) return "please provide user";
        if (!prompt) return "please provide prompt";
        if (!image_url) return "please provide image_url";

        const { id: userId } = user;
        await checkUserTokenUsage(userId);

        const content: ChatCompletionContentPart[] = [
            { type: "text", text: prompt },
            {
                type: "image_url",
                image_url: {
                    url: image_url,
                    detail: "auto",
                },
            },
        ];
        const completion = await openAIGPT4VChatCompletionsCreate(content);

        // update user token usage
        const total_tokens = completion.usage?.total_tokens ?? 0;
        const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
            { userId: user.id },
            { $inc: { "tokenUsed": total_tokens } },
            { upsert: true, new: true }
        );

        // update imageInterpretation count
        await findOneAndUpdateUserUsageStatDocument(
            { userId: user.id },
            { $inc: { "imageInterpretationCount": 1 } },
            { upsert: true, new: true }
        );

        return completion;

    } catch (error: any) {
        return error?.message;
    }
}