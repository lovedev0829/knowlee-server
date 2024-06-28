import mongoose, { Document, model, Schema } from "mongoose";

export interface IUserReferral extends Document {
  userId: string;
  invitedEmails: {
    email: string;
    sentAt: Date;
    signedUp: boolean;
    signedUpAt: Date | null;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const UserReferralSchema = new mongoose.Schema<IUserReferral>({
  userId: {
    type: String,
    ref: "User",
    required: true,
  },
  invitedEmails: [
    {
      _id: false,  //disable _id
      email: { type: String, required: true },
      sentAt: { type: Date, required: true, default: Date.now },
      signedUp: { type: Boolean, required: true, default: false },
      signedUpAt: { type: Date, required: true, default: null },
    },
  ],
},
  {
    strict: false,
    timestamps: true,
  }
);

const UserReferralModel = mongoose.model<IUserReferral>(
  "userReferral",
  UserReferralSchema,
);

export default UserReferralModel