import mongoose, { Document, Schema } from "mongoose";

export type RedditComment = {
  id: string;
  parsedId: string;
  url: string;
  parentId?: string;
  username: string;
  category: string;
  communityName: string;
  body: string;
  createdAt: string;
  scrapedAt: string;
  upVotes: number;
  numberOfreplies?: number;
  html: string | null;
  dataType: "comment";
};

export type RedditPost = {
  id: string;
  entityId: string;

  parsedId: string;
  url: string;
  username: string;
  title: string;
  communityName: string;
  parsedCommunityName?: string;
  body: string;
  html: string | null;
  numberOfComments: number;
  flair: string;
  upVotes: number;
  isVideo: boolean;
  isAd: boolean;
  over18: boolean;
  createdAt: Date;
  scrapedAt: Date;
  dataType: "post";
  comments: RedditComment;
};
// Define the interface for the Reddit document
export type IRedditDocument = RedditPost & Document;

// Create a Mongoose schema for the Reddit data
const redditSchema = new Schema<IRedditDocument>(
  {
    id: { type: String, required: true },
    parsedId: { type: String, required: true },
    url: { type: String, required: true },
    username: { type: String, required: true },
    title: { type: String },
    communityName: { type: String, required: true },
    parsedCommunityName: { type: String },
    body: { type: String, required: true },
    html: { type: String, default: null },
    numberOfComments: { type: Number },
    flair: { type: String },
    upVotes: { type: Number, required: true },
    isVideo: { type: Boolean },
    isAd: { type: Boolean },
    over18: { type: Boolean },
    createdAt: { type: Date, required: true, default: Date.now },
    scrapedAt: { type: Date, required: true, default: Date.now },
    dataType: { type: String, required: true, enum: ["post", "comment"] },
    entityId: {
      type: String,
      ref: "Entity",
      required: true,
    },
    comments: { type: Object }
  },
  {
    collection: "reddit", // Set the collection name to 'reddit'
    strict: false,
  }
);

redditSchema.virtual("entity", {
  ref: "Entity",
  localField: "entityId",
  foreignField: "id",
});

// Create a Mongoose model for the Reddit data using the schema
const RedditModel = mongoose.model<IRedditDocument>("Reddit", redditSchema);

export default RedditModel;
