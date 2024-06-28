import mongoose, { Document, Schema } from "mongoose";
import { Thread } from "openai/resources/beta/threads/threads";
import { openAIThreadsDel, openAIThreadsGet } from "../../services/openAI.services";

export interface IUserThreadDocument extends Document {
    title: string;
    createdAt: Date;
    creatorId: string;
    thread: Thread;
    updatedAt: Date;
}

const userThreadSchema = new Schema<IUserThreadDocument>(
    {
        title: { type: String, required: true },
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


userThreadSchema.pre("deleteMany", async function (next) {
    const filter = this.getFilter()
    const threadsList: any[] = await this.model.find(filter);
    const promises = [];

    // Delete all user threads from openAI
    for (const userThread of threadsList) {
        promises.push(openAIThreadsDel(userThread.thread.id)); 
    }
    await Promise.all(promises);
    next()
})

userThreadSchema.virtual("creator", {
    ref: "User",
    localField: "creatorId",
    foreignField: "id",
});

const UserThreadModel = mongoose.model<IUserThreadDocument>(
    "UserThread",
    userThreadSchema
);

export default UserThreadModel;
