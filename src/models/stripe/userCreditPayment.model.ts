import mongoose, { Schema, Document } from "mongoose";

export interface IUserCreditPayment extends Document {
    amount_subtotal: number;
    amount_total: number;
    createdAt: Date;
    quantity: number;
    stripeCheckoutSessionId: string;
    stripeCustomerId: string;
    userId: string;
    updatedAt: Date;
}

const UserCreditPaymentSchema = new Schema<IUserCreditPayment>(
    {
        amount_subtotal: { type: Number },
        amount_total: { type: Number },
        quantity: {
            type: Number,
            default: 0,
        },
        stripeCheckoutSessionId: { type: String },
        stripeCustomerId: { type: String, required: true },
        userId: {
            type: String,
            ref: "User",
            required: true,
        },
    },
    {
        strict: false,
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

UserCreditPaymentSchema.virtual("user", {
    ref: "User",
    localField: "userId",
    foreignField: "id",
    justOne: true,
});

export const UserCreditPayment = mongoose.model<IUserCreditPayment>(
    "UserCreditPayment",
    UserCreditPaymentSchema
);
