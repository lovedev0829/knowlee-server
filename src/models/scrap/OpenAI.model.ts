import mongoose, { Document, Schema } from "mongoose";

export type OpenAICrawlMetadata = {
  loadedUrl: string;
  loadedTime: string;
  referrerUrl: string;
  depth: number;
  httpStatusCode: number;
};

export type OpenAIMetadata = {
  canonicalUrl: string;
  title: string;
  description: string;
  author: null | string;
  keywords: string;
  languageCode: string;
};

export type OpenAIData = {
  entityId: string;
  url: string;
  crawl: {
    loadedUrl: string;
    loadedTime: string;
    referrerUrl: string;
    depth: number;
    httpStatusCode: number;
  };
  metadata: OpenAIMetadata;
  screenshotUrl: null | string;
  text: string;
};

// Define the interface for the Reddit document
export type IOpenAIDocument = OpenAIData & Document;

// Create a Mongoose schema for the Reddit data
const openAISchema = new Schema<IOpenAIDocument>(
  {
    entityId: { type: String, required: true },
    url: {
      type: String,
      required: true,
    },
    crawl: {
      loadedUrl: {
        type: String,
        required: true,
      },
      loadedTime: {
        type: Date,
        required: true,
      },
      referrerUrl: {
        type: String,
        required: true,
      },
      depth: {
        type: Number,
        required: true,
      },
      httpStatusCode: {
        type: Number,
        required: true,
      },
    },
    metadata: {
      canonicalUrl: {
        type: String,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      author: String,
      keywords: {
        type: String,
        required: true,
      },
      languageCode: {
        type: String,
        required: true,
      },
    },
    screenshotUrl: String,
    text: {
      type: String,
      required: true,
    },
  },
  {
    collection: "openai", // Set the collection name to 'reddit'
    strict: false,
  }
);

openAISchema.virtual("entity", {
  ref: "Entity",
  localField: "entityId",
  foreignField: "id",
});

// Create a Mongoose model for the Reddit data using the schema
const OpenAIModel = mongoose.model<IOpenAIDocument>("OpenAI", openAISchema);

export default OpenAIModel;
