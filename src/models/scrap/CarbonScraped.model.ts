import mongoose, { Document, Schema } from "mongoose";

export interface ICarbonScraped extends Document {
  entityId: string;
  text: string;
}

const CarbonScrapedSchema = new Schema<ICarbonScraped>(
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
  },
  {
    timestamps: true,
    strict: false,
    strictQuery: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

CarbonScrapedSchema.virtual("entity", {
  ref: "Entity",
  localField: "entityId",
  foreignField: "id",
});

const CarbonScraped = mongoose.model<ICarbonScraped>(
  "CarbonScraped",
  CarbonScrapedSchema
);

export default CarbonScraped;
