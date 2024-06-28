import mongoose, { Schema, Document } from "mongoose";

// Interface for the Stripe Product document
interface IStripeProduct extends Document {
    id: string;
    object: string;
    active: boolean;
    created: number;
    default_price?: string;
    description?: string;
    features: string[];
    images: string[];
    livemode: boolean;
    metadata: Record<string, any>;
    name: string;
    package_dimensions?: string;
    shippable?: string;
    statement_descriptor?: string;
    tax_code?: string;
    unit_label?: string;
    updated: number;
    url?: string;
}

// Mongoose schema for the Stripe Product
const stripeProductSchema = new Schema<IStripeProduct>(
    {
        id: { type: String, required: true },
        object: { type: String, required: true },
        active: { type: Boolean, required: true },
        created: { type: Number, required: true },
        default_price: { type: String, default: null },
        description: { type: String, default: null },
        features: { type: [String], default: [] },
        images: { type: [String], default: [] },
        livemode: { type: Boolean, required: true },
        metadata: { type: Object, default: {} },
        name: { type: String, required: true },
        package_dimensions: { type: String, default: null },
        shippable: { type: String, default: null },
        statement_descriptor: { type: String, default: null },
        tax_code: { type: String, default: null },
        unit_label: { type: String, default: null },
        updated: { type: Number, required: true },
        url: { type: String, default: null },
    },
    {
        strict: false,
    }
);

export const StripeProduct = mongoose.model<IStripeProduct>(
    "stripeProduct",
    stripeProductSchema
);
