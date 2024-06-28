import mongoose, { Document, Schema } from "mongoose";

type GithubFile = {
  pageContent: string;
  metadata: {
    source: string;
  };
};

type IGithub = {
  id: string;
  url: string;
  entityId: string;
  createdAt: Date;
  scrapedAt: Date;
  content: GithubFile[];
};

type IGithubDocument = IGithub & Document;

const githubContentSchema = new Schema<GithubFile>({
  pageContent: { type: String },
  metadata: {
    source: { type: String },
  },
});

const githubSchema = new Schema<IGithubDocument>(
  {
    id: { type: String },
    url: { type: String },
    entityId: {
      type: String,
      ref: "Entity",
      required: true,
    },
    content: [githubContentSchema],
    createdAt: { type: Date, required: true, default: Date.now },
    scrapedAt: { type: Date, required: true, default: Date.now },
  },
  {
    collection: "github", // Set the collection name to 'github'
    strict: false,
  }
);

// Create a Mongoose model for the Github data using the schema
const GithubModel = mongoose.model<IGithubDocument>("Github", githubSchema);

export default GithubModel;
