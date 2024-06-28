import mongoose, { Document, Schema } from "mongoose";

// Define the interface for the medium document
export interface IMediumDocument extends Document {
    url: string;
    title: string;
    description: string;
    entityId: string;
    links: string[];
    image: string;
    content: string;
    author: string;
    source: string;
    published: Date;
    ttr: number;
}

// Create a Mongoose schema for the medium
const mediumSchema = new Schema<IMediumDocument>(
    {
        url: { type: String },
        title: { type: String },
        description: { type: String },
        entityId: {
            type: String,
            ref: "Entity",
            required: true,
        },
        links: { type: [String] },
        image: { type: String },
        content: { type: String },
        author: { type: String },
        source: { type: String },
        published: { type: Date },
        ttr: { type: Number },
    },
    {
        collection: "medium", // Set the collection name to 'medium'
        strict: false,
    }
);

mediumSchema.virtual("entity", {
    ref: "Entity",
    localField: "entityId",
    foreignField: "id",
});

// Create a Mongoose model for the Medium using the schema
const MediumModel = mongoose.model<IMediumDocument>("Medium", mediumSchema);

export default MediumModel;
