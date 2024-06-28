import { model, Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IEntity extends Document {
  id: string;
  value: string;
  sourceType: string;
  subSetType: string;
  isScraped: boolean;
  isNoData: boolean;
  createdAt: Date;
  originId?: string;
  fileId?: string;
  isScheduled?: boolean;
  tokens?: number;
}

const EntitySchema = new Schema<IEntity>(
  {
    id: {
      type: String,
      default: uuidv4,
      required: true,
      unique: true,
    },
    value: { type: String, required: true },
    sourceType: { type: String, required: true },
    subSetType: { type: String, required: true },
    isScraped: { type: Boolean, required: true, default: false },
    isNoData: { type: Boolean, required: true, default: false },
    originId: { type: String, ref: "Entity" },
    fileId: { type: String },
    isScheduled: { type: Boolean, default: true },
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

EntitySchema.virtual("origin", {
  ref: "Entity",
  localField: "originId",
  foreignField: "id",
});

// EntitySchema.post<IEntity[]>("insertMany", (res, next) => {
//   for (const entity of res) {
//     processEntity(entity);
//   }
//   next();
// });

// EntitySchema.post<IEntity>("save", (res, next) => {
//   processEntity(res);
//   next();
// });

export const EntityModel = model<IEntity>("Entity", EntitySchema);
