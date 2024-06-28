import mongoose, { Document, Model } from "mongoose";
import { ISubscriptionFeature } from "./subscriptionFeature.model";

export type StripeSubscriptionStatus =
    | "active"
    | "canceled"
    | "incomplete"
    | "incomplete_expired"
    | "past_due"
    | "paused"
    | "trialing"
    | "unpaid";

// Interface representing the UserSubscription
export interface UserSubscriptionDocument extends Document {
    createdAt: Date;
    userId: string;
    plan: mongoose.Types.ObjectId | ISubscriptionFeature;
    hasTrial: boolean;
    startDate: Date;
    endDate: Date;
    canceledAt?: Date;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    stripePriceId: string;
    stripeCurrentPeriodEnd?: Date;
    status: StripeSubscriptionStatus;
    stripeProductId?: string;
    updatedAt: Date;
}

// Create a Mongoose schema
const userSubscriptionSchema = new mongoose.Schema<UserSubscriptionDocument>(
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
        canceledAt: { type: Date },
        stripeCustomerId: { type: String, required: true },
        stripeSubscriptionId: { type: String, required: true },
        stripePriceId: { type: String, required: true },
    stripeCurrentPeriodEnd: { type: Date },
        status: { type: String },
        stripeProductId: { type: String },
    },
    {
        strict: false,
        timestamps: true,
        collection: "usersubscriptions"
    }
);

// Create and export the Mongoose model
const UserSubscription = mongoose.model<UserSubscriptionDocument>(
    "UserSubscription",
    userSubscriptionSchema
);

export default UserSubscription;
