import mongoose, { Document, Schema } from "mongoose";

// Define the interface for the Google Headline document
export interface IGoogleHeadlineDocument extends Document {
    link: string;
    title: string;
    source: string;
    publishedAt: Date;
    content: string;
    entityId: string;
}

// Create a Mongoose schema for the Google Headline
const googleHeadlineSchema = new Schema<IGoogleHeadlineDocument>({
    link: {
        type: String,
        required: true,
    },
    title: { type: String },
    source: { type: String },
    publishedAt: { type: Date },
    content: {
        type: String,
        required: true,
    },
    entityId: {
        type: String,
        ref: "Entity",
        required: true,
    },
},
    {
        strict: false,
    }
);

googleHeadlineSchema.virtual("entity", {
    ref: "Entity",
    localField: "entityId",
    foreignField: "id",
});

// Create a Mongoose model for the Google HeadLine using the schema
const GoogleHeadlineModel = mongoose.model<IGoogleHeadlineDocument>(
    "GoogleHeadline",
    googleHeadlineSchema
);

export default GoogleHeadlineModel;
