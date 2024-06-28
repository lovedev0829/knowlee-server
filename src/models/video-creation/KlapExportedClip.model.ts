import mongoose, { Document, Schema } from "mongoose";
import { KlapExportedClip } from "../../types/klap.types";

export interface IKlapExportedClipDocument extends Document, KlapExportedClip {
    userId: string;
    id: string;
    sourceVideoUrl: string;
}

const KlapExportedClipSchema = new Schema<IKlapExportedClipDocument>(
    {
        userId: {
            type: String,
            ref: "User",
            required: true,
        },
        video_id: {
            type: String,
            ref: "KlapVideo",
            required: true,
        },
        clip_id: {
            type: String,
            ref: "KlapVideoClip",
            required: true,
        },
        id: {
            type: String,
            required: true,
        },
        sourceVideoUrl: {
            type: String,
            required: true,
        },
        created_at: { type: String },
        author_id: { type: String },
        name: { type: String },
        src_url: { type: String },
        progress: { type: Number },
        status: { type: String },
    },
    {
        timestamps: true,
        strict: false,
        strictQuery: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

KlapExportedClipSchema.virtual("user", {
    ref: "User",
    localField: "userId",
    foreignField: "id",
    justOne: true,
});

KlapExportedClipSchema.virtual("klapVideo", {
    ref: "KlapVideo",
    localField: "video_id",
    foreignField: "id",
    justOne: true,
});

KlapExportedClipSchema.virtual("klapVideoClip", {
    ref: "KlapVideoClip",
    localField: "clip_id",
    foreignField: "id",
    justOne: true,
});

const KlapExportedClip = mongoose.model<IKlapExportedClipDocument>(
    "KlapExportedClip",
    KlapExportedClipSchema
);

export default KlapExportedClip;
