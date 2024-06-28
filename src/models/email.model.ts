import { Document, model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IEmail extends Document {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmailSchema = new Schema<IEmail>({
  id: {
    type: String,
    default: uuidv4,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
},
  {
    timestamps: true,
  }
);

export const EmailModel = model<IEmail>("Email", EmailSchema);
