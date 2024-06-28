import mongoose, { Schema, Document } from "mongoose";

export interface ITelegramConfig extends Document {
  userId: string;
  token: {
    access_token?: string;
    expires_at?: number;
    expires_in?: number;
    refresh_token?: string;
    scope?: string;
    token_type?: string;
  }
}

const TelegramConfigSchema = new Schema<ITelegramConfig>(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    token: {
      type: {
        access_token: String,
        expires_at: Number,
        expires_in: Number,
        refresh_token: String,
        scope: String,
        token_type: String
      },
      required: true,
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

TelegramConfigSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "id",
  justOne: true,
});

const TelegramConfigModel = mongoose.model<ITelegramConfig>(
  "TelegramConfig",
  TelegramConfigSchema
);

export default TelegramConfigModel;
