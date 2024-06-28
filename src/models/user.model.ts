import { Document, model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { upsertDefaultKnowledge } from "../services/defaultKnowledge.services";
import { createStripeCustomerFromUser } from "../lib/stripe";

export interface User extends Document {
  id: string;
  auth0Id: string;
  username?: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  cryptoInsightInterests: string[];
  level: number;
  loyaltyPoints: number;
  isSegmentationCompleted: boolean;
  onboardingStep: number;
  hasAcceptedTosPp: boolean;
  createdAt: Date;
  refCode?: string;
  cookiesAccepted: boolean;
  isSuperAdmin: boolean;
  welcomeTourCompleted: boolean;
  stripeCustomerId: string;
  updateAt: Date;
}

const UserSchema = new Schema<User>({
  id: {
    type: String,
    default: uuidv4,
    required: true,
    unique: true,
  },
  auth0Id: {
    // this will store the `sub` field from Auth0
    type: String,
    required: true,
    unique: true,
  },
  username: { type: String, sparse: true},
  email: { type: String, required: true, unique: true },
  profilePicture: { type: String },
  bio: { type: String },
  cryptoInsightInterests: {
    type: [{ type: String }],
    default: [],
  },
  level: { type: Number, default: 1 },
  loyaltyPoints: { type: Number, default: 0 },
  isSegmentationCompleted: { type: Boolean, default: false },
  onboardingStep : { type: Number, default: 1 },
  hasAcceptedTosPp: { type: Boolean, default: false },
  refCode: { type: String },
  cookiesAccepted: {
    type: Boolean,
    default: false,
  },
  isSuperAdmin: {
    type: Boolean,
    default: false,
    required: true,
  },
  welcomeTourCompleted: {
    type: Boolean,
    default: false,
  },
  stripeCustomerId: { type: String },
}, {
  timestamps: true,
});

UserSchema.pre("save", async function (next) {
  try {
    if (this.isNew) {
      //console.log("creating new User...", this);
      // paused pinecone
      // upsertDefaultKnowledge(this);

      // create stripe customer
      createStripeCustomerFromUser(this);
    }
  } catch (error) {
    //console.log("UserSchema pre save Error:", error);
  } finally {
    next();
  }
});

export const UserModel = model<User>("User", UserSchema);
