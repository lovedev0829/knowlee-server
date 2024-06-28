import { Document, model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IDefaultKnowledge extends Document {
  id: string;
  defaultContent: string;
}

const DefaultKnowledgeSchema = new Schema<IDefaultKnowledge>(
  {
    id: {
      type: String,
      default: uuidv4,
      required: true,
      unique: true,
    },
    defaultContent: {
      type: String,
      required: true,
    },
  },
  {
    collection: "defaultknowledge",
  }
);

export const DefaultKnowledgeModel = model<IDefaultKnowledge>(
  "DefaultKnowledge",
  DefaultKnowledgeSchema
);
