import mongoose, { Document, Model } from "mongoose";

// Interface representing the UserSubscription
export interface SubscriptionHistoryDocument extends Document {
  userId: string;
  plan: mongoose.Types.ObjectId;
  hasTrial: boolean;
  startDate: Date;
  endDate: Date;

  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  stripeCurrentPeriodEnd?: Date;

  isActive: Boolean;
  status: string;
}

// Create a Mongoose schema
const subscriptionHistorySchema =
  new mongoose.Schema<SubscriptionHistoryDocument>(
    {
      userId: {
        type: String,
        ref: "User",
        required: true,
      },
      plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubscriptionFeature",
        required: true,
      },
      hasTrial: {
        type: Boolean,
        required: true,
        default: false,
      },
      startDate: {
        type: Date,
        required: true,
        default: Date.now,
      },
      endDate: { type: Date, required: true },

      stripeCustomerId: { type: String },
      stripeSubscriptionId: { type: String },
      stripePriceId: { type: String },
      stripeCurrentPeriodEnd: { type: Date },

      status: { type: String },
    },
    {
      strict: false,
      timestamps: true,
      collection: "subscriptionhistory",
    }
  );

// Create and export the Mongoose model
const SubscriptionHistory = mongoose.model<SubscriptionHistoryDocument>(
  "SubscriptionHistory",
  subscriptionHistorySchema
);

export default SubscriptionHistory;
