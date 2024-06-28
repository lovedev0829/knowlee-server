import mongoose, { Schema, Document } from "mongoose";

export interface ITwitterConfig extends Document {
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

const TwitterConfigSchema = new Schema<ITwitterConfig>(
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

TwitterConfigSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "id",
  justOne: true,
});

const TwitterConfigModel = mongoose.model<ITwitterConfig>(
  "TwitterConfig",
  TwitterConfigSchema
);

export default TwitterConfigModel;
