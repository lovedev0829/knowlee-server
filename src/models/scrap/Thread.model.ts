import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for the Twitter thread document
export interface IThread extends Document {
    entityId: string;
    id: string;
    url: string;
    verified: boolean;
    username: string;
    fullname: string;
    images: string[];
    timestamp: Date;
    text: string;
    isPinned: boolean;
    isQuote: boolean;
    isRetweet: boolean;
    likes: number;
    replies: number;
    retweets: number;
    quotes: number;
    __IMTLENGTH__: number;
    __IMTINDEX__: number;
}

// Create a Mongoose schema for the Twitter thread
const threadSchema = new Schema<IThread>({
    entityId: {
        type: String,
        ref: "Entity",
        required: true,
    },
    id: { type: String },
    url: { type: String },
    verified: { type: Boolean },
    username: { type: String },
    fullname: { type: String },
    images: [{ type: String }],
    timestamp: { type: Date },
    text: { type: String },
    isPinned: { type: Boolean },
    isQuote: { type: Boolean },
    isRetweet: { type: Boolean },
    likes: { type: Number },
    replies: { type: Number },
    retweets: { type: Number },
    quotes: { type: Number },
    __IMTLENGTH__: { type: Number },
    __IMTINDEX__: { type: Number },
},
    {
        strict: false,
    }
);

threadSchema.virtual("entity", {
    ref: "Entity",
    localField: "entityId",
    foreignField: "id",
});

// Create a Mongoose model for the Thread using the schema
const ThreadModel = mongoose.model<IThread>('Thread', threadSchema);

export default ThreadModel;
