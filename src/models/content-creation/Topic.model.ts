import mongoose, { Document, Schema } from "mongoose";
import { ContentFormat } from "./Content.model";

export type GeneratedFrom = "Custom" | "Dashboard" | "Evergreen";

// Interface for the Topic document
export interface ITopicDocument extends Document {
    contentFormats: ContentFormat[];
    userId: string;
    topicTitle: string;
    generatedFrom: GeneratedFrom;
    createdAt: Date;
    updatedAt: Date;
}

// Mongoose schema for the Topic
const topicSchema = new Schema<ITopicDocument>(
    {
        contentFormats: {
            type: [{
                type: String,
                enum: ["tweet", "thread", "article", "email", "post"],
            }],
            default: [],
            required: true,
        },
        userId: {
            type: String,
            ref: "User",
            required: true,
        },
        topicTitle: {
            type: String,
            required: true,
        },
        generatedFrom: {
            type: String,
            enum: ["Custom", "Dashboard", "Evergreen"],
            required: true,
        },
    },
    { timestamps: true }
);

// Mongoose model for the Topic
const TopicModel = mongoose.model<ITopicDocument>("Topic", topicSchema);

export default TopicModel;
