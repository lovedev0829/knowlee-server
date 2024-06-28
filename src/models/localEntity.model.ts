import { model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

// The only difference at the moment is the fact that value and subsetType is not unique or required
// this is because we don't need to check for unique values for local files since there is no way to compare
// online entities are checked based on their unique value represented by an url
// TODO: create a parent schema for both local and online entities

export interface ILocalEntity extends Document {
  id: string;
  value: string;
  fileName: string;
  sourceType: string;
  subSetType?: string;
  isScraped: boolean;
  fileId?: string;
  createdAt: Date;
  tokens?: number;
}

const LocalEntitySchema = new Schema<ILocalEntity>(
  {
    id: {
      type: String,
      default: uuidv4,
      required: true,
      unique: true,
    },
    value: { type: String },
    fileName: { type: String },
    sourceType: { type: String, required: true },
    subSetType: { type: String },
    isScraped: { type: Boolean, required: true },
    fileId: { type: String },
    tokens: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: {
      createdAt: true,
    },
  }
);

export const LocalEntityModel = model<ILocalEntity>(
  "LocalEntity",
  LocalEntitySchema
);
