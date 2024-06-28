import mongoose, { Schema, Document } from "mongoose";

// Interface for the Stripe Price document
interface IStripePrice extends Document {
    id: string;
    object: string;
    active: boolean;
    billing_scheme: string;
    created: number;
    currency: string;
    custom_unit_amount: number | null;
    livemode: boolean;
    lookup_key: string | null;
    metadata: Record<string, any>;
    nickname: string | null;
    product: string;
    recurring: {
        aggregate_usage: string | null;
        interval: string;
        interval_count: number;
        usage_type: string;
    };
    tax_behavior: string;
    tiers_mode: string | null;
    transform_quantity: string | null;
    type: string;
    unit_amount: number;
    unit_amount_decimal: string;
}

// Mongoose schema for the Stripe Price
const stripePriceSchema = new Schema<IStripePrice>(
    {
        id: { type: String, required: true },
        object: { type: String, required: true },
        active: { type: Boolean, required: true },
        billing_scheme: { type: String, required: true },
        created: { type: Number, required: true },
        currency: { type: String, required: true },
        custom_unit_amount: { type: Number, default: null },
        livemode: { type: Boolean, required: true },
        lookup_key: { type: String, default: null },
        metadata: { type: Object, default: {} },
        nickname: { type: String, default: null },
        product: { type: String, required: true },
        recurring: {
            aggregate_usage: { type: String, default: null },
            interval: { type: String, required: true },
            interval_count: { type: Number, required: true },
            usage_type: { type: String, required: true },
        },
        tax_behavior: { type: String, required: true },
        tiers_mode: { type: String, default: null },
        transform_quantity: { type: String, default: null },
        type: { type: String, required: true },
        unit_amount: { type: Number, required: true },
        unit_amount_decimal: { type: String, required: true },
    },
    {
        strict: false,
    }
);

export const StripePrice = mongoose.model<IStripePrice>(
    "stripePrice",
    stripePriceSchema
);
