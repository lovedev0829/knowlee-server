import mongoose, { Schema, Document } from "mongoose";

// Interface for the Subscription Features document
export interface ISubscriptionFeature extends Document {
    name: string;
    price: number;
    fullprice: number;
    features: SubscriptionPlanFeatures;
    additionalPerks: string;
    subscriptionPlan: mongoose.Types.ObjectId;
    interval: string;
    planType: string;
    priority: number;
    livemode: boolean;
}

export interface SubscriptionPlanFeatures {
    maxTokens: number;
    maxStaticDataSourceCount: number;
    maxLocalFileSourceCount: number;
    maxDynamicDataSourceCount: number;
    maxUserAgentCount: number;
    maxImageInterpretationCount: number;
    maxTextToImageCount: number;
    maxTextToVideoCount: number;
    speechToTextCount: {
        maxCount?: number;
        unlimited: boolean;
    }
}

// Mongoose schema for the Subscription Features
const subscriptionFeaturesSchema = new Schema<ISubscriptionFeature>(
    {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        fullprice: { type: Number },
        features: {
            maxTokens: {
                type: Number,
                required: true,
                default: 0,
            },
            maxLocalFileSourceCount: {
                type: Number,
                required: true,
                default: 0
            },
            maxStaticDataSourceCount: {
                type: Number,
                required: true,
                default: 0
            },
            maxDynamicDataSourceCount: {
                type: Number,
                required: true,
                default: 0
            },
            maxUserAgentCount: {
                type: Number,
                required: true,
                default: 0
            },
            maxImageInterpretationCount: {
                type: Number,
                required: true,
                default: 0
            },
            maxTextToImageCount: {
                type: Number,
                required: true,
                default: 0
            },
            maxTextToVideoCount: {
                type: Number,
                required: true,
                default: 0
            },
            speechToTextCount: {
                maxCount: {
                    type: Number,
                    required: true,
                    default: 0
                },
                unlimited: {
                    type: Boolean,
                    required: true,
                    default: false
                },
            },
        },
        additionalPerks: { type: String, default: "" },
        interval: { type: String, required: true },
        planType: { type: String, required: true },
        priority: { type: Number, required: true },
        subscriptionPlan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubscriptionPlan",
            required: true,
        },
        livemode: {
            type: Boolean,
            required: true,
        },
    },
    {
        strict: false,
        strictQuery: false,
    }
);

export const SubscriptionFeature = mongoose.model<ISubscriptionFeature>(
    "SubscriptionFeature",
    subscriptionFeaturesSchema
);
