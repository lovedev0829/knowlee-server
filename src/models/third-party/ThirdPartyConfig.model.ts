import { Schema, InferSchemaType, model, Document } from "mongoose";
import { decryptThirdPartyConfigData } from "../../services/thirdPartyConfig.services";

const ThirdPartyConfigSchema = new Schema(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    google: {
      token: {
        type: {
          access_token: String,
          refresh_token: {
            type: String,
            required: true,
          },
          scope: String,
          token_type: String,
          expiry_date: Number,
        },
      },
    },
    microsoft: {
      token: {
        type: {
          access_token: String,
          expires_in: Number,
          ext_expires_in: Number,
          refresh_token: {
            type: String,
            required: true,
          },
          scope: String,
          token_type: String,
        },
      },
    },
    linkedin: {
      token: {
        type: {
          access_token: String,
          expires_in: Number,
          refresh_token: String,
          refresh_token_expires_in: Number,
          scope: String,
          token_type: String,
          updatedAt: Date,
        },
      },
      userInfo: {
        type: {
          email: String,
          email_verified: Boolean,
          family_name: String,
          given_name: String,
          locale: { country: String, language: String },
          name: String,
          picture: String,
          sub: String,
        },
      },
    },
    trello: {
      token: {
        type: {
          access_token: String,
          access_token_secret: String,
          oauth_token: String,
          oauth_token_secret: String,
          updatedAt: Date,
        },
      },
    },
    tiktok: {
      token: {
        type: {
          access_token: String,
          expires_in: Number,
          refresh_token: {
            type: String,
            required: true,
          },
          refresh_token_expires_in: Number,
          scope: String,
          token_type: String,
          updatedAt: Date,
        },
      }
    },
    twitter: {
      token: {
        type: {
          token_type: String,
          expires_in: Number,
          access_token: String,
          scope: String,
          refresh_token: String,
          updatedAt: Date,
        },
      },
    },
    medium: {
      token: {
        type: {
          access_token: String,
          updatedAt: Date,
        },
      },
      userInfo: {
        type: {
          id: String,
          username: String,
          name: String,
          url: String,
          imageUrl: String,
        },
      },
    },
    notion: {
      token: {
        type: {
          access_token: String,
        },
      },
    },
    youtube: {
      token: {
        type: {
          access_token: String,
          refresh_token: {
            type: String,
            required: true,
          },
          scope: String,
          token_type: String,
          expiry_date: Number,
        },
      },
    },
    telegram: {
      token: {
        type: {
          access_token: String,
          updatedAt: String,
        },
      },
      botId: { type: Number },
      bot_username: { type: String, required: true },
      assistant_id: { type: String },
    },
    discord: {
      token: {
        type: {
          access_token: String,
        },
      },
      serverId: { type: String },
    },
    slack: {
      token: {
        type: {
          ok: Boolean,
          app_id: String,
          authed_user: {
            id: String,
            scope: String,
            access_token: String,
            token_type: String,
          },
          scope: String,
          token_type: String,
          access_token: String,
          bot_user_id: String,
          team: {
            id: String,
            name: String,
          },
          is_enterprise_install: Boolean,
          updatedAt: Date,
        },
      },
    },
    openai: {
      type: {
        apiKey: String,
        updatedAt: Date,
      },
    },
  },
  {
    timestamps: true,
    strict: false,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret?.google?.token?.refresh_token;
        delete ret?.microsoft?.token?.refresh_token;
        delete ret?.linkedin?.token?.refresh_token;
        delete ret?.twitter?.token?.refresh_token;
      },
    },
    toObject: { virtuals: true },
  }
);

ThirdPartyConfigSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "id",
  justOne: true,
});

// Decrypts data after retrieving from the database
ThirdPartyConfigSchema.post("findOneAndUpdate", async function (doc) {
  if (doc) decryptThirdPartyConfigData(doc);
});

ThirdPartyConfigSchema.post(["find", "updateMany"], function (docs) {
  if (Array.isArray(docs)) {
    docs.forEach((doc) => {
      if (doc) decryptThirdPartyConfigData(doc);
    });
  }
});

ThirdPartyConfigSchema.post(["findOne", "updateOne"], function (doc) {
  if (doc) decryptThirdPartyConfigData(doc);
});

export type ThirdPartyConfig = InferSchemaType<typeof ThirdPartyConfigSchema> &
  Document;

const ThirdPartyConfigModel = model<ThirdPartyConfig>(
  "ThirdPartyConfig",
  ThirdPartyConfigSchema
);

export default ThirdPartyConfigModel;
