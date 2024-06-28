import mongoose, { Document, Schema } from "mongoose";
import { InferSchemaType } from "mongoose";

const userProcessSchema = new Schema(
    {
        creatorId: {
            type: String,
            ref: "User",
            required: true,
        },
        avatar: {
            name: {
                type: String,
            },
            color: {
                type: String,
            },
        },
        goals: {
            type: [
                {
                    goal: { type: String, required: true },
                    assistantId: {
                        type: String,
                        required: true,
                    },
                },
            ],
            default: [],
        },
        interval: {
            type: String,
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
        isRecurring: {
            type: Boolean,
        },
        jobId: {
            type: Schema.Types.ObjectId,
            ref: "AgendaJob",
        },
        name: {
            type: String,
            required: true,
        },
        runs: {
            type: Number,
            default: 7,
        },
        scheduledAt: {
            type: Date,
        },
        // threadId: {
        //     type: String,
        // },
        threadIds: [
            {
                type: String,
            },
        ],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

userProcessSchema.virtual("creator", {
    ref: "User",
    localField: "creatorId",
    foreignField: "id",
    justOne: true,
});

export type IUserProcessDocument = InferSchemaType<typeof userProcessSchema> &
    Document;

const UserProcessModel = mongoose.model<IUserProcessDocument>(
    "UserProcess",
    userProcessSchema
);

export default UserProcessModel;
