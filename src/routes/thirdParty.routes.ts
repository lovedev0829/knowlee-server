import express from "express";
import { errorWrap } from "../utils/errors.util";
import { checkJwt } from "../middleware/auth";
import { checkUser } from "../middleware/checkUser";
import {
  getThirdPartyConfigController,
  rotateEncryptionKeyController,
  saveOpenAIAPIKeyController,
} from "../controllers/thirdParty.controller";
import {
  generateExportUrlContentController,
  googleAuthCallbackController,
  googleLoginController,
} from "../controllers/google.controller";
import { microsoftAuthCallbackController, microsoftLoginController } from "../controllers/microsoft.controller";
import {
  linkedInAuthCallbackController,
  linkedInLoginController,
} from "../controllers/linkedin.controller";
import { twitterAuthCallbackController, twitterLoginController } from "../controllers/twitter.controller";
import { addMediumAccessTokenController, mediumAuthCallbackController, mediumLoginController } from "../controllers/medium.controller";
import { addTelegramAccessTokenController, telegramAuthCallbackController, telegramLoginController } from "../controllers/telegram.controller";
import {
  trelloAuthCallbackController,
  trelloLoginController,
} from "../controllers/trello.controller";
import { slackAuthCallbackController, slackLoginController } from "../controllers/slack.controller";

import { 
  notionAuthCallbackController, 
  notionLoginController } 
  from "../controllers/notion.controller";

import { 
    tiktokAuthCallbackController, 
    tiktokLoginController } 
from "../controllers/tiktok.controller";

import { 
    youtubeAuthCallbackController, 
    youtubeLoginController } 
from "../controllers/youtube.controller";

import { 
  addDiscordAccessTokenController,
  discordAuthCallbackController, 
  discordLoginController } 
  from "../controllers/discord.controller";
  
const router = express.Router();

router.get(
  "/google/auth/callback",
  errorWrap(
    googleAuthCallbackController,
    "Something went wrong with the google callback"
  )
);

router.get(
  "/microsoft/auth/callback",
  errorWrap(
    microsoftAuthCallbackController,
    "Something went wrong with the microsoft callback"
  )
);

router.get(
  "/linkedin/auth/callback",
  errorWrap(
    linkedInAuthCallbackController,
    "Something went wrong with the linkedin callback"
  )
);

router.get(
  "/twitter/auth/callback",
  errorWrap(
    twitterAuthCallbackController,
    "Something went wrong with the twitter callback"
  )
);

router.get(
  "/medium/auth/callback",
  errorWrap(
    mediumAuthCallbackController,
    "Something went wrong with the medium callback"
  )
);

router.get(
  "/slack/auth/callback",
  errorWrap(
    slackAuthCallbackController,
    "Something went wrong with the slack callback"
  )
);

router.get(
  "/trello/auth/callback",
  errorWrap(
    trelloAuthCallbackController,
    "Something went wrong with the trello auth callback"
  )
);

router.get(
  "/notion/auth/callback",
  errorWrap(
    notionAuthCallbackController,
    "Something went wrong with the notion callback"
  )
);

router.get(
  "/tiktok/auth/callback",
  errorWrap(
    tiktokAuthCallbackController,
      "Something went wrong with the notion callback"
  )
);

router.get(
  "/youtube/auth/callback",
  errorWrap(
    youtubeAuthCallbackController,
    "Something went wrong with the notion callback"
  )
);

router.get(
  "/discord/auth/callback",
  errorWrap(
    discordAuthCallbackController,
    "Something went wrong with the discord callback"
  )
);

router.post(
  "/token/rotate-encryption-key",
  errorWrap(rotateEncryptionKeyController, "Could not rotate encryption key")
);

router.use(errorWrap(checkJwt, "Could not check jwt"));
router.use(errorWrap(checkUser, "Could not check  "));

router.get(
  "/config",
  errorWrap(getThirdPartyConfigController, "could not get third party config")
);

router.post(
  "/google/auth/login",
  errorWrap(googleLoginController, "could not login to google")
);

router.post(
  "/microsoft/auth/login",
  errorWrap(microsoftLoginController, "could not login to microsoft")
);

router.post(
  "/linkedin/auth/login",
  errorWrap(linkedInLoginController, "could not login to LinkedIn")
);

router.post(
  "/twitter/auth/login",
  errorWrap(twitterLoginController, "could not login to twitter")
);

router.post(
  "/medium/auth/login",
  errorWrap(mediumLoginController, "could not login to medium")
);

router.post(
  "/slack/auth/login",
  errorWrap(slackLoginController, "could not login to slack")
);

router.post(
  "/trello/auth/login",
  errorWrap(trelloLoginController, "could not login to trello")
);

router.post(
  "/notion/auth/login",
  errorWrap(notionLoginController, "could not login to notion")
);

router.post(
  "/tiktok/auth/login",
  errorWrap(tiktokLoginController, "could not login to notion")
);

router.post(
  "/youtube/auth/login",
  errorWrap(youtubeLoginController, "could not login to notion")
);

router.post(
  "/discord/auth/login",
  errorWrap(discordLoginController, "could not login to discord")
);

router.post(
  "/google/generate-export-url-content",
  errorWrap(generateExportUrlContentController, "could not generate export url")
);

router.post(
  "/medium/add-access-token",
  errorWrap(addMediumAccessTokenController, "could not login to medium")
);

router.post(
  "/telegram/add-access-token",
  errorWrap(addTelegramAccessTokenController, "could not login to telegram")
);

router.post(
  "/discord/add-access-token",
  errorWrap(addDiscordAccessTokenController, "could not login to Discord")
);

router.post(
  "/openai/api-key",
  errorWrap(saveOpenAIAPIKeyController, "Could not save your API key")
);

export default router;
