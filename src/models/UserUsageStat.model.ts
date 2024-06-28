import mongoose, { Schema, Document } from "mongoose";

export interface IUserUsageStat extends Document {
  createdAt: Date;
  credit: {
    total: number;
    used: number;
  };
  entityCount: {
    carbon: {
      dropbox: number;
      google_drive: number;
      notion: number;
      onedrive: number;
      outlook: number;
      sharepoint: number;
    };
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
    };
    gitbook: {
      url: number;
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
  textToAudioCount: number;
  textToImage: {
    dalle3Count: number;
    sdxlCount: number;
  };
  textToVideoCount: number;
  tokenUsed: number,
  totalEmbeddingTokenUsed: number,
  totalRunTokenUsed: number,
  updatedAt: Date;
  userAgentCount: number,
  userId: string;
  userProcessCount: number,
  userThreadCount: number,
  filesAttachedToAgentsCost: number,
}

const UserUsageStatSchema = new Schema<IUserUsageStat>(
  {
    credit: {
      total: {
        type: Number,
        default: 0,
        min: 0,
        required: true,
      },
      used: {
        type: Number,
        default: 0,
        min: 0,
        required: true,
      },
    },
    entityCount: {
      carbon: {
        dropbox:{
          type: Number,
          default: 0,
          min: 0,
          required: true,
        },
        google_drive:{
          type: Number,
          default: 0,
          min: 0,
          required: true,
        },
        notion:{
          type: Number,
          default: 0,
          min: 0,
          required: true,
        },
        onedrive:{
          type: Number,
          default: 0,
          min: 0,
          required: true,
        },
        outlook:{
          type: Number,
          default: 0,
          min: 0,
          required: true,
        },
        sharepoint:{
          type: Number,
          default: 0,
          min: 0,
          required: true,
        },
      },
      youtube: {
        account: {
          type: Number,
          default: 0,
          min: 0,
          required: true,
        },
        video: {
          type: Number,
          default: 0,
          min: 0,
          required: true,
        },
      },
      twitter: {
        tweet: {
          type: Number,
          default: 0,
          min: 0,
          required: true,
        },
        thread: {
          type: Number,
          default: 0,
          min: 0,
          required: true,
        },
        profile: {
          type: Number,
          default: 0,
          min: 0,
          required: true,
        },
        cashtag: {
          type: Number,
          default: 0,
          min: 0,
          required: true,
        },
        hashtag: {
          type: Number,
          default: 0,
          min: 0,
          required: true,
        },
      },
      medium: {
        article: {
          type: Number,
          default: 0,
          min: 0,
          required: true,
        },
        account: {
          type: Number,
          default: 0,
          min: 0,
          required: true,
        },
      },
      news: {
        keyword: {
          type: Number,
          default: 0,
          min: 0,
          required: true,
        },
        url: {
          type: Number,
          default: 0,
          min: 0,
          required: true,
        },
      },
      pdf: {
        url: {
          type: Number,
          default: 0,
          min: 0,
          required: true,
        },
      },
      url: {
        url: {
          type: Number,
          default: 0,
          min: 0,
          required: true,
        },
      },
      coda: {
        url: {
          type: Number,
          default: 0,
          min: 0,
          required: true,
        },
      },
      reddit: {
        url: {
          type: Number,
          default: 0,
          min: 0,
          required: true,
        },
      },
      gitbook: {
        url: {
          type: Number,
          default: 0,
          min: 0,
          required: true,
        },
      },
      openai: {
        url: {
          type: Number,
          default: 0,
          min: 0,
          required: true,
        },
      },
      github: {
        url: {
          type: Number,
          default: 0,
          min: 0,
          required: true,
        },
      },
    },
    localEntityCount: {
      type: Number,
      default: 0,
      min: 0,
      required: true,
    },
    imageInterpretationCount: {
      type: Number,
      default: 0,
      min: 0,
      required: true,
    },
    speechToTextCount: {
      type: Number,
      default: 0,
      min: 0,
      required: true,
    },
    textToAudioCount: {
      type: Number,
      default: 0,
      min: 0,
      required: true,
    },
    textToImage: {
      dalle3Count: {
        type: Number,
        default: 0,
        min: 0,
        required: true,
      },
      sdxlCount: {
        type: Number,
        default: 0,
        min: 0,
        required: true,
      },
    },
    textToVideoCount: {
      type: Number,
      default: 0,
      min: 0,
      required: true,
    },
    tokenUsed: {
      type: Number,
      default: 0,
      min: 0,
      required: true,
    },
    totalEmbeddingTokenUsed: {
      type: Number,
      default: 0,
      min: 0,
      required: true,
    },
    totalRunTokenUsed: {
      type: Number,
      default: 0,
      min: 0,
      required: true,
    },
    userAgentCount: {
      type: Number,
      default: 0,
      min: 0,
      required: true,
    },
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    userProcessCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    userThreadCount: {
      type: Number,
      default: 0,
      min: 0,
      required: true,
    },
    filesAttachedToAgentsCost : {
      type: Number,
      default: 0,
      min: 0,
      required: true,
    },
  },
  {
    timestamps: true,
    strict: false,
    strictQuery: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

UserUsageStatSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "id",
  justOne: true,
});

const UserUsageStatModel = mongoose.model<IUserUsageStat>(
  "UserUsageStat",
  UserUsageStatSchema
);

export default UserUsageStatModel;
