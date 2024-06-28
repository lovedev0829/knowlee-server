import mongoose, { Document, Schema } from "mongoose";
import { InferSchemaType } from "mongoose";

const OneDriveScrapedSchema = new Schema(
  {
    contentType: {
      type: String,
      required: true,
    },
    entityId: {
      type: String,
      ref: "Entity",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    itemId: {
      type: String,
      required: true,
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

OneDriveScrapedSchema.virtual("entity", {
  ref: "Entity",
  localField: "entityId",
  foreignField: "id",
  justOne: true,
});

export type IOneDriveScraped = InferSchemaType<typeof OneDriveScrapedSchema> &
  Document;

const OneDriveScraped = mongoose.model(
  "OneDriveScraped",
  OneDriveScrapedSchema
);

export default OneDriveScraped;
