import mongoose, { Document, Schema } from "mongoose";

// Define the interface for the tweet document
export interface ITweet extends Document {
    id: string;
    url: string;
    urls: unknown[];
    origin: string;
    symbols: unknown[];
    user_id: string;
    hashtags: unknown[];
    startUrl: string;
    username: string;
    full_text: string;
    is_pinned: boolean;
    created_at: Date;
    is_retweet: boolean;
    view_count: number;
    quote_count: number;
    reply_count: number;
    is_truncated: boolean;
    quoted_tweet?: {
        id: string | null;
        url: string | null;
        // Add more fields as needed
    };
    retweet_count: number;
    user_mentions: unknown[];
    favorite_count: number;
    is_quote_tweet: boolean;
    conversation_id: string;
    entityId: string;
}

// Create a Mongoose schema for the tweet
const tweetSchema = new Schema<ITweet>({
    id: { type: String },
    url: { type: String },
    urls: { type: [Schema.Types.Mixed], default: [] },
    origin: { type: String },
    symbols: { type: [Schema.Types.Mixed], default: [] },
    user_id: { type: String },
    hashtags: { type: [Schema.Types.Mixed], default: [] },
    startUrl: { type: String },
    username: { type: String },
    full_text: { type: String },
    is_pinned: { type: Boolean, default: false },
    created_at: { type: Date },
    is_retweet: { type: Boolean, default: false },
    view_count: { type: Number },
    quote_count: { type: Number },
    reply_count: { type: Number },
    is_truncated: { type: Boolean, default: false },
    quoted_tweet: {
        id: { type: String, default: null },
        url: { type: String, default: null },
        // Add more fields as needed
    },
    retweet_count: { type: Number },
    user_mentions: { type: [Schema.Types.Mixed], default: [] },
    favorite_count: { type: Number },
    is_quote_tweet: { type: Boolean, default: false },
    conversation_id: { type: String },
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

tweetSchema.virtual("entity", {
    ref: "Entity",
    localField: "entityId",
    foreignField: "id",
});

// Create a Mongoose model for the tweet using the schema
const TweetModel = mongoose.model<ITweet>("Tweet", tweetSchema);

export default TweetModel;
