import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for the YouTube document
export interface IYouTube extends Document {
    url: string;
    title: string;
    author: string;
    length: number;
    origin: string;
    source: string;
    transcript: string;
    view_count: number;
    description?: string;
    entityId: string;
    publish_date: Date;
}

// Create a Mongoose schema for the YouTube data
const youTubeSchema = new Schema<IYouTube>({
    url: { type: String },
    title: { type: String },
    author: { type: String },
    length: { type: Number },
    origin: { type: String },
    source: { type: String },
    transcript: { type: String },
    view_count: { type: Number },
    description: { type: String },
    entityId: {
        type: String,
        ref: "Entity",
        required: true,
    },
    publish_date: { type: Date },
}, {
    collection: 'youtube', // Set the collection name to 'youtube'
    strict: false,
});

// Create a Mongoose model for the YouTube data using the schema
const YouTubeModel = mongoose.model<IYouTube>('YouTube', youTubeSchema);

export default YouTubeModel;
