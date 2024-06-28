import mongoose, { Schema, Document } from "mongoose";

export interface ISubscriptionPlan extends Document {
    interval?: string;
    livemode: boolean;
    name: string;
    planType: string;
    openai_model: string;
    price: number;
    priority: number;
    stripeProductId: string;
    stripePriceId: string;
    subscriptionFeature?: mongoose.Types.ObjectId;
    couponCode?: string;
}

const SubscriptionPlanSchema = new Schema<ISubscriptionPlan>(
    {
        interval: { type: String },
        livemode: { type: Boolean, required: true },
        name: { type: String, required: true },
        planType: { type: String, required: true },
        openai_model: { type: String, required: true },
        price: { type: Number, required: true },
        priority: { type: Number, required: true },
        stripeProductId: { type: String, required: true },
        stripePriceId: { type: String, required: true },
        subscriptionFeature: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubscriptionFeature",
        },
        couponCode: {type: String, default: null},
    },
    {
        strict: false,
        timestamps: true,
        collection: "subscriptionplans"
    }
);

export const SubscriptionPlan = mongoose.model<ISubscriptionPlan>(
    "SubscriptionPlan",
    SubscriptionPlanSchema
);
