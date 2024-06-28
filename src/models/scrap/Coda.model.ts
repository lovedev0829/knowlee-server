import mongoose, { Document, Schema } from "mongoose";

// interface for the CODA document
export interface ICODADocument extends Document {
    url: string;
    title: string;
    description: string;
    entityId: string;
    links: string[];
    image: string;
    text: string;
    author: string;
    favicon?: string;
    source: string;
    published?: Date;
    ttr: number;
}

// Mongoose schema for the CODA
const codaSchema = new Schema<ICODADocument>(
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
        text: { type: String },
        author: { type: String },
        favicon: { type: String },
        source: { type: String },
        published: { type: Date },
        ttr: { type: Number },
    },
    {
        strict: false,
    }
);

codaSchema.virtual("entity", {
    ref: "Entity",
    localField: "entityId",
    foreignField: "id",
});

// Mongoose model for the URL using the schema
const CODAModel = mongoose.model<ICODADocument>("CODA", codaSchema);

export default CODAModel;
