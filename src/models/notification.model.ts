import { Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface INotification extends Document {
  id: string;
  userId: string;
  title: string;
  message: string;
  url: string;
  isViewed: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    id: {
      type: String,
      default: uuidv4,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    isViewed: {
      type: Boolean,
      default: false
    },
  },
  {
    timestamps: {
      createdAt: true,
    }
  }
);

export const NotificationModel = model<INotification>(
  "Notification",
  NotificationSchema
);
