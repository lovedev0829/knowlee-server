import mongoose, { Document, Schema } from "mongoose";

export interface IGoogleDriveScraped extends Document {
  entityId: string;
  text: string;
  title: string;
}

const GoogleDriveScrapedSchema = new Schema<IGoogleDriveScraped>(
  {
    entityId: {
      type: String,
      ref: "Entity",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    title: {
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

GoogleDriveScrapedSchema.virtual("entity", {
  ref: "Entity",
  localField: "entityId",
  foreignField: "id",
});

const GoogleDriveScraped = mongoose.model<IGoogleDriveScraped>(
  "GoogleDriveScraped",
  GoogleDriveScrapedSchema
);

export default GoogleDriveScraped;
