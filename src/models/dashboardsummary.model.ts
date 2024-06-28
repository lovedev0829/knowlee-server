import { Document, model, Schema } from "mongoose";

export interface IDashboardSummary extends Document {
  auth0Id: string;
  email: string;
  userId: string;
  news: {
    imageUrl: string;
    title: string;
    sourceType: string;
    entityId: string;
    url: string;
  }[];
}

const DasboardsummarySchema = new Schema<IDashboardSummary>({
  auth0Id: String,
  email: String,
  userId: {
    type: String,
    ref: "User",
    required: true,
  },
  news: [
    {
      imageUrl: "String",
      title: "String",
      sourceType: String,
      entityId: { type: String, ref: "Entity" },
      url: { type: String },
    },
  ],
});

DasboardsummarySchema.virtual("entity", {
  ref: "Entity",
  localField: "entityId",
  foreignField: "id",
});

DasboardsummarySchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: 'id'
});

export const DashboardsummaryModel = model<IDashboardSummary>(
  "dashboardsummary",
  DasboardsummarySchema,
  "dashboardsummary"
);
