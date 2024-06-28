import mongoose, { Document, Schema } from "mongoose";
import { KlapVideoClip } from "../../types/klap.types";

export interface IKlapVideoClipDocument extends Document, KlapVideoClip {
    userId: string;
    id: string;
    sourceVideoUrl: string;
}

const KlapVideoClipSchema = new Schema<IKlapVideoClipDocument>(
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
        id: {
            type: String,
            required: true,
        },
        sourceVideoUrl: {
            type: String,
            required: true,
        },
        created_at: { type: String },
        name: { type: String },
        virality_score: { type: Number },
        virality_score_explanation: { type: String },
        preset_id: { type: String },
        dimensions_width: { type: Number },
        dimensions_height: { type: Number },
        duration_seconds: { type: Number },
    },
    {
        timestamps: true,
        strict: false,
        strictQuery: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

KlapVideoClipSchema.virtual("user", {
    ref: "User",
    localField: "userId",
    foreignField: "id",
    justOne: true,
});

KlapVideoClipSchema.virtual("klapVideo", {
    ref: "KlapVideo",
    localField: "video_id",
    foreignField: "id",
    justOne: true,
});

const KlapVideoClip = mongoose.model<IKlapVideoClipDocument>(
    "KlapVideoClip",
    KlapVideoClipSchema
);

export default KlapVideoClip;
