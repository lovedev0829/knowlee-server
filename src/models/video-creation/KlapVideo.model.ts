import mongoose, { Document, Schema } from "mongoose";
import { KlapVideo } from "../../types/klap.types";

export interface IKlapVideoDocument extends Document, KlapVideo {
    userId: string;
    id: string;
    language?: string;
    maxDuration?: number;
    sourceVideoUrl: string;
}

const KlapVideoSchema = new Schema<IKlapVideoDocument>(
    {
        userId: {
            type: String,
            ref: "User",
            required: true,
        },
        id: {
            type: String,
            required: true,
        },
        language: {
            type: String,
        },
        maxDuration: {
            type: Number,
        },
        sourceVideoUrl: {
            type: String,
            required: true,
        },
        created_at: {
            type: String,
        },
        youtube_vid: {
            type: String,
        },
        status: {
            type: String,
        },
        title: {
            type: String,
        },
        description: {
            type: String,
        },
        error_code: {
            type: String,
        },
        duration: {
            type: Number,
        },
        detected_language: {
            type: String,
        },
        translate_to: {
            type: String,
        },
        src_url: {
            type: String,
        },
        src_frame_count: {
            type: Number,
        },
        src_fps: {
            type: Number,
        },
        src_width: {
            type: Number,
        },
        src_height: {
            type: Number,
        },
        lowres_src_url: {
            type: String,
        },
        lowres_src_fps: {
            type: Number,
        },
        lowres_src_frame_count: {
            type: Number,
        },
        lowres_src_width: {
            type: Number,
        },
        lowres_src_height: {
            type: Number,
        },
    },
    {
        timestamps: true,
        strict: false,
        strictQuery: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

KlapVideoSchema.virtual("user", {
    ref: "User",
    localField: "userId",
    foreignField: "id",
    justOne: true,
});

const KlapVideo = mongoose.model<IKlapVideoDocument>(
    "KlapVideo",
    KlapVideoSchema
);

export default KlapVideo;
