import mongoose, { Schema, Document } from "mongoose";

export interface IUserUsageHistory extends Document {
  createdAt: Date;
  credit: {
    total: number;
    used: number;
  };
  endDate: Date;
  entityCount: {
    youtube: {
      account: number;
      video: number;
    };
    twitter: {
      tweet: number;
      thread: number;
      profile: number;
      cashtag: number;
      hashtag: number;
    };
    medium: {
      article: number;
      account: number;
    };
    news: {
      keyword: number;
      url: number;
    };
    pdf: {
      url: number;
    };
    url: {
      url: number;
    };
    coda: {
      url: number;
    };
    reddit: {
      url: number;
    gitbook: {
        url: number;
      };
    };
    openai: {
      url: number;
    };
    github: {
        url: number;
    };
  };
  imageInterpretationCount: number;
  localEntityCount: number;
  speechToTextCount: number;
  stripeCustomerId: string;
  stripePriceId: string;
  stripeSubscriptionId: string;
  startDate: Date;
  textToAudioCount: number;
  textToImage: {
    dalle3Count: number;
    sdxlCount: number;
  };
  textToVideoCount: number;
  tokenUsed: number;
  totalEmbeddingTokenUsed: number;
  updatedAt: Date;
  userAgentCount: number;
  userId: string;
  userThreadCount: number;
  filesAttachedToAgentsCost: number;
}

const UserUsageHistorySchema = new Schema<IUserUsageHistory>(
  {
    credit: {
      total: {
        type: Number,
        default: 0,
        required: true,
      },
      used: {
        type: Number,
        default: 0,
        required: true,
      },
    },
    endDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    entityCount: {
      youtube: {
        account: {
          type: Number,
          default: 0,
        },
        video: {
          type: Number,
          default: 0,
        },
      },
      twitter: {
        tweet: {
          type: Number,
          default: 0,
        },
        thread: {
          type: Number,
          default: 0,
        },
        profile: {
          type: Number,
          default: 0,
        },
        cashtag: {
          type: Number,
          default: 0,
        },
        hashtag: {
          type: Number,
          default: 0,
        },
      },
      medium: {
        article: {
          type: Number,
          default: 0,
        },
        account: {
          type: Number,
          default: 0,
        },
      },
      news: {
        keyword: {
          type: Number,
          default: 0,
        },
        url: {
          type: Number,
          default: 0,
        },
      },
      pdf: {
        url: {
          type: Number,
          default: 0,
        },
      },
      url: {
        url: {
          type: Number,
          default: 0,
        },
      },
      coda: {
        url: {
          type: Number,
          default: 0,
        },
      },
      reddit: {
        url: {
          type: Number,
          default: 0,
        },
      },
      openai: {
        url: {
          type: Number,
          default: 0,
        },
      },
      gitbook: {
        url: {
          type: Number,
          default: 0,
        },
      },
      github: {
        url: {
          type: Number,
          default: 0,
        },
      },
    },
    localEntityCount: {
      type: Number,
      default: 0,
    },
    imageInterpretationCount: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    speechToTextCount: {
      type: Number,
      default: 0,
    },
    stripeCustomerId: { type: String, required: true },
    stripePriceId: { type: String, required: true },
    stripeSubscriptionId: { type: String, required: true },
    textToAudioCount: {
      type: Number,
      default: 0,
    },
    textToImage: {
      dalle3Count: {
        type: Number,
        default: 0,
      },
      sdxlCount: {
        type: Number,
        default: 0,
      },
    },
    textToVideoCount: {
      type: Number,
      default: 0,
    },
    tokenUsed: {
      type: Number,
      default: 0,
    },
    totalEmbeddingTokenUsed: {
      type: Number,
      default: 0,
    },
    userAgentCount: {
      type: Number,
      default: 0,
    },
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    userThreadCount: {
      type: Number,
      default: 0,
    },
    filesAttachedToAgentsCost: {
      type: Number,
      default: 0,
      min: 0,
      required: true,
    },
  },
  {
    timestamps: true,
    strict: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

UserUsageHistorySchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "id",
  justOne: true,
});

const UserUsageHistoryModel = mongoose.model<IUserUsageHistory>(
  "UserUsageHistory",
  UserUsageHistorySchema
);

export default UserUsageHistoryModel;
