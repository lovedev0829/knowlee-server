import { Document, InferSchemaType, model, Schema, Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { decryptData, encryptData } from "../utils/encryption";

export const PANEL_OPTIONS = {
  IMAGE: "image",
  AUDIO: "audio",
  VIDEO: "video",
  DOCUMENT: "document",
  IMAGE_INTERPRETER: "image-interpreter",
} as const;


export type PanelOptionType = (typeof PANEL_OPTIONS)[keyof typeof PANEL_OPTIONS];

export interface IQueryQuestion extends Document {
  createdAt: Date;
  id: string;
  question: string;
  answer: string;
  conversation: Types.ObjectId;
  type: PanelOptionType;
  data: any;
  updateAt: Date;
};

const QueryQuestionSchema = new Schema<IQueryQuestion>({
  id: {
    type: String,
    default: uuidv4,
    required: true,
    unique: true,
  },
  question: {
    type: String,
    default: "",
  },
  answer: {
    type: String,
    default: "",
  },
  conversation: { type: Schema.Types.ObjectId, ref: "Conversation" },
  type: {
    type: String,
    enum: Object.values(PANEL_OPTIONS),
  },
  data: {
    type: Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

export type QueryQuestion = InferSchemaType<typeof QueryQuestionSchema>;

// encrypts data before saving to MongoDB
QueryQuestionSchema.pre("save", async function (next) {
  this.question = encryptData(this.question)
  this.answer = encryptData(this.answer)
  next()
})

const decryptQuestionData = (doc: QueryQuestion) => {
  doc.question = decryptData(doc.question)
  doc.answer = decryptData(doc.answer)
}

// decrypts data after retrieving from database
QueryQuestionSchema.post(["find", "updateMany"], function (docList) {
  docList && docList.length && docList.map(decryptQuestionData)
})

// decrypts data after retrieving from database
QueryQuestionSchema.post(["findOne", "updateOne"], decryptQuestionData)

export const QueryQuestionModel = model<QueryQuestion>("QueryQuestion", QueryQuestionSchema);
