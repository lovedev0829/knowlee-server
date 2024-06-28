import mongoose, { Document, Schema, Types } from "mongoose";

export type ContentFormat = "tweet" | "thread" | "article" | "email" | "post";

// Interface for the Content document
export interface IContentDocument extends Document {
    contentData: string;
    contentFormat: ContentFormat;
    contentTitle: string;
    createdAt: Date;
    jobId?: Types.ObjectId;
    metadata: unknown;
    scheduledAt?: Date;
    topicId: Types.ObjectId;
    updatedAt: Date;
    userId: string;
}

// Mongoose schema for the Content
const ContentSchema = new Schema<IContentDocument>(
    {
        contentData: {
            type: String,
            required: true,
        },
        contentFormat: {
            type: String,
            enum: ["tweet", "thread", "article", "email", "post"],
            required: true,
        },
        contentTitle: {
            type: String,
            required: true,
        },
        jobId: {
            type: Schema.Types.ObjectId,
            ref: 'AgendaJob',
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
        },
        scheduledAt: {
            type: Date,
        },
        topicId: {
            type: Schema.Types.ObjectId,
            ref: "Topic",
            required: true,
        },
        userId: {
            type: String,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

// Mongoose model for the Content
const ContentModel = mongoose.model<IContentDocument>("Content", ContentSchema);

export default ContentModel;
