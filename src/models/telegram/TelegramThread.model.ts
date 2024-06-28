import mongoose, { Document, Schema } from "mongoose";
import { Thread } from "openai/resources/beta/threads/threads";
import { openAIThreadsDel } from "../../services/openAI.services";

export interface ITelegramThreadDocument extends Document {
    chat_id: string;
    from_id: string;
    botId: string;
    creatorId: string;
    thread: Thread;
    createdAt: Date;
    updatedAt: Date;
}

const TelegramThreadSchema = new Schema<ITelegramThreadDocument>(
    {
        chat_id: { type: String, required: true },
        from_id: { type: String, required: true },
        botId: { type: String, required: true },
        creatorId: {
            type: String,
            ref: "User",
            required: true,
        },
        thread: {
            type: {
                id: {
                    type: String,
                    required: true,
                },
                created_at: {
                    type: Number,
                    required: true,
                },
                metadata: {
                    type: mongoose.Schema.Types.Mixed,
                    default: null,
                },
                object: {
                    type: String,
                },
            },
            required: true,
        },
    },
    {
        timestamps: true,
    }
);


TelegramThreadSchema.pre("deleteMany", async function (next) {
    const filter = this.getFilter()
    const threadsList: any[] = await this.model.find(filter);
    const promises = [];

    // Delete all user threads from openAI
    for (const telegramThread of threadsList) {
        promises.push(openAIThreadsDel(telegramThread.thread.id)); 
    }
    await Promise.all(promises);
    next()
})

TelegramThreadSchema.virtual("creator", {
    ref: "User",
    localField: "creatorId",
    foreignField: "id",
});

const TelegramThreadModel = mongoose.model<ITelegramThreadDocument>(
    "TelegramThread",
    TelegramThreadSchema
);

export default TelegramThreadModel;
