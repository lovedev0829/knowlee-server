import { model, Schema } from "mongoose";
import type { UserSetting } from "../types/userSetting";

export const defaultPlayHTVoice = "en-US-JennyNeural";

const UserSettingSchema = new Schema<UserSetting>({
  user: {
    type: String,
    required: true,
    unique: true,
    ref: "User",
  },
  notification: {
    inAppPlatformUpdatesAndAnnouncements: { type: Boolean, default: true },
    inAppSpecialOffersAndPromotions: { type: Boolean, default: true },
    emailPlatformUpdatesAndAnnouncements: { type: Boolean, default: true },
    emailSpecialOffersAndPromotions: { type: Boolean, default: true },
  },
  preference: {
    language: { type: String, default: "en" },
  },
  action: {
    includeSavingData: { type: Boolean, default: true },
    notify: { type: Boolean, default: true },
    analyzeData: { type: Boolean, default: true },
  },
  textToAudioSetting: {
    voice: {
      type: String,
      required: true,
      default: defaultPlayHTVoice,
    },
    clonedVoices: {
      type: [
        {
          id: String,
          name: String,
          type: {
            type: String,
          },
        }
      ],
      default: []
    },
  },
  specialDiscountUsed: {
    type: Boolean,
    default: false,
  },
  downgradeAnswers: {
    type: {
      why: {
        type: String,
      },
      suggestion: {
        type: String,
      }
    }
  }
},
  {
    timestamps: true,
    strict: false,
});

export const UserSettingModel = model("UserSetting", UserSettingSchema);
