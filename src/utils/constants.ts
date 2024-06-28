export const NOTIFICATION_SETTINGS_OPTIONS = {
  NEW_NOTIFICATION: "newNotification",
  CHAT_INVITATION: "chatInvitation",
  MENTION: "mention",
} as const;

export enum SOURCE_TYPES {
  TWITTER = "twitter",
  YOUTUBE = "youtube",
  MEDIUM = "medium",
  CODA = "coda",
  PDF = "pdf",
  CSV = "csv",
  NEWSAPI = "news",
  REDDIT = "reddit",
  GITBOOK = "gitbook",
  OPENAI = "openai",
  GITHUB = "github",
}

export const STRING_FALSE = "false";

export const DEFAULT_USER_SETTINGS = {
  user: "",
  notification: {
    inAppPlatformUpdatesAndAnnouncements: true,
    inAppSpecialOffersAndPromotions: true,
    emailPlatformUpdatesAndAnnouncements: true,
    emailSpecialOffersAndPromotions: true,
  },
  preference: {
    language: "en",
  },
  action: {
    includeSavingData: true,
    notify: true,
    analyzeData: true,
  },
};

export const NO_MERKETING_USER_SETTINGS = {
  user: "",
  notification: {
    inAppPlatformUpdatesAndAnnouncements: true,
    inAppSpecialOffersAndPromotions: true,
    emailPlatformUpdatesAndAnnouncements: true,
    emailSpecialOffersAndPromotions: false,
  },
  preference: {
    language: "en",
  },
  action: {
    includeSavingData: true,
    notify: true,
    analyzeData: true,
  },
};

export const POSSIBLE_SOURCE_TYPES_AND_THEIR_SUBTYPES: {
  [key: string]: string[];
} = {
  youtube: ["account", "video"],
  twitter: ["tweet", "thread", "profile", "cashtag", "hashtag"],
  medium: ["article", "account", "profile", "cashtag", "hashtag"],
  news: ["keyword", "url"],
  pdf: ["url"],
  url: ["url"],
  coda: ["url"],
  reddit: ["url"],
  gitbook: ["url"],
  openai: ["url"],
  github: ["url"],
};

export const status = {
  success: 200,
  resource_added: 201,
  not_registered: 401,
  unauthorized: 401,
  user_failed_credential: 401,
  bad_request: 400,
  not_found: 404,
  resource_exist: 409,
  empty_fields: 422,
  validation_error: 422,
  error: 500,
};

export const OPENAI_ACTOR_ID = "aYG0l9s7dbB7j3gbS"

export const ACTOR_IDS = {
  OPENAI_ACTOR_ID
} as const;