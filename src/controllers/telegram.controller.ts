import { Request, Response } from "express";
import { sendResponse } from "../utils/response.utils";
import { RequestError } from "../utils/globalErrorHandler";
import { findOneTelegramConfig } from "../services/telegramConfig.services";
import { findOneAndUpdateThirdPartyConfig, findOneThirdPartyConfig } from "../services/thirdPartyConfig.services";
// import { telegramRetrieveMemberDetails } from "../lib/telegram/telegram.services";
import { UpdateQuery } from "mongoose";
import { ThirdPartyConfig } from "../models/third-party/ThirdPartyConfig.model";
import { encryptData } from "../utils/encryption";
import axios from "axios";
import { sendMessage } from "../services/openai/functions/telegram";
import {
  createTelegramThread,
  findOneAndUpdateTelegramThreadDocument,
  findTelegramThreadDocuments,
  getBotInfo,
} from "../lib/telegram/telegram.services";
import {
  openAIThreadRunCreate,
  openAIThreadRunGet,
  openAIThreadsCreate,
  openAIThreadsMessagesCreate,
  openAIThreadsMessagesList,
  waitForRunCompletion,
} from "../services/openAI.services";
import { Run } from "openai/resources/beta/threads/runs/runs";
import { getUser } from "../services/user.services";
import { User } from "../models/user.model";
import { TelegramMessage } from "../types/telegram.types";

// import { getTelegramAuthURL } from "../lib/telegram.services";

const SERVER_BASE_URL = process.env.SERVER_BASE_URL!;
const TELEGRAM_URL = "https://api.telegram.org/";
const webhookUrl = process.env.DEPLOY_ENV === "production" ? `${SERVER_BASE_URL}/api/telegram/webhook` : "https://13ec-150-107-232-104.ngrok-free.app/api/telegram/webhook"

export async function telegramAuthCallbackController(
  req: Request,
  res: Response
) {
  try {
    const { code, state, userId } = req.query;
    // console.log("req.query----->", req.query);
    return sendResponse(res, 200, "Authorization successful");
  } catch (error) {
    throw new RequestError(error as string, 500);
  }
}

export async function telegramLoginController(req: Request, res: Response) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;
  // const authURL = getTelegramAuthURL({ userId: userId });
  const authURL = "";
  return sendResponse(res, 200, "success", { authURL: authURL });
}

export async function getTelegramConfigController(req: Request, res: Response) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;

  const telegramConfig = await findOneTelegramConfig({ userId: userId });
  return sendResponse(res, 200, "success", telegramConfig);
}

export async function addTelegramAccessTokenController(req: Request, res: Response) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;
  const {accessToken, assistant_id} = req.body;

  if (!accessToken) throw new RequestError("Access Token is required", 400);

  const updateObject: UpdateQuery<ThirdPartyConfig> = {};

  // get telegram userInfo
  // const telegramUserInfo = await telegramRetrieveMemberDetails({
  //   accessToken,
  // });

  // if(!telegramUserInfo) throw new RequestError("Invalid access token", 400);

  // updateObject[`telegram.userInfo`] = telegramUserInfo;
  updateObject[`telegram.token.access_token`] = encryptData(accessToken);
  updateObject[`telegram.assistant_id`] = assistant_id;
  updateObject[`telegram.token.updatedAt`] = Date.now();

  // get botId and store that in the database
  const botInfo = await getBotInfo({botToken: accessToken});
  const { id: botId, username: bot_username } = botInfo || {};
  updateObject[`telegram.botId`] = botId;
  updateObject[`telegram.bot_username`] = bot_username;

  // update telegram token in database
  await findOneAndUpdateThirdPartyConfig(
    { userId: userId },
    updateObject,
    {
      upsert: true,
      new: true,
    }
  );

  // setup the webhook
  const url = `${TELEGRAM_URL}bot${accessToken}/setWebhook`;
  await axios.get(url, {
    params: {
      url: `${webhookUrl}/botId/${botId}/userId/${userId}`,
      drop_pending_updates: true,
    },
  });

  return sendResponse(res, 200, "success", { });
}

export async function telegramWebhookController(req: Request, res: Response) {
  try {
    const message = req.body.message;
    // console.log("message----->", message);

    if (!message) {
      return res.sendStatus(200);
    }

    const chatId = message.chat.id;
    const fromId = message.from.id;
    const textMessage = message.text;
    const { botId, userId } = req.params;

    if (!textMessage) {
      // console.log("No text in message object", message);
      return res.sendStatus(200);
    }

    const user = await getUser(userId);

    const config = await findOneThirdPartyConfig({ userId: userId });
    const assistant_id = config?.telegram?.assistant_id;
    const bot_username = config?.telegram?.bot_username;

    const { chat } = message as TelegramMessage;
    const { type: chatType } = chat;

    if (
      chatType === "channel" ||
      chatType === "group" ||
      chatType === "supergroup"
    ) {
      const botMentioned = (message as TelegramMessage).entities?.some(
        (entity) =>
          entity.type === "mention" &&
          textMessage
            .substring(entity.offset, entity.offset + entity.length)
            .includes(bot_username)
      );
      if (!botMentioned) {
        // return early if bot is not mentioned in group chat
        return res.sendStatus(200);
      }
    }

    // logic - check for the existing telegramthread with botid and userid,  if found then append the chat message in that otherwise create new thread and append the message to that thread
    const telegramThread = await findTelegramThreadDocuments(
      {
        botId: botId,
        creatorId: userId,
        chat_id: chatId,
        from_id: fromId,
      },
      {},
      {}
    );

    let thread_id;
    if (textMessage === "/start") {
      // create new OpenAI thread
      const thread = await openAIThreadsCreate();
      thread_id = thread.id;
      // create telegram thread or update threadId
      await findOneAndUpdateTelegramThreadDocument(
        {
          chat_id: chatId,
        },
        {
          chat_id: chatId,
          from_id: fromId,
          botId: botId,
          creatorId: userId,
          thread: thread,
        },
        {
          new: true,
          upsert: true,
        }
      );
    } else if (telegramThread.length > 0) {
      thread_id = telegramThread[0].thread.id;
    } else {
      // create new thread in telegramthread
      const telegramThread = await createTelegramThread({
        userId,
        chat_id: chatId,
        from_id: message.from.id,
        botId: botId,
      });

      thread_id = telegramThread?.thread.id;
    }

    const createdMessage = await openAIThreadsMessagesCreate(thread_id, {
      content: textMessage,
      role: "user",
    });

    // need to set the logic fo rassistant_id
    const createdRun = await openAIThreadRunCreate(thread_id, {
      assistant_id: assistant_id as string,
    });

    const run = await openAIThreadRunGet(thread_id, (createdRun as Run)?.id);

    // Wait for run completion
    await waitForRunCompletion(thread_id, run.id, (user as User));

    // retrieve last message
    const messages = await openAIThreadsMessagesList(thread_id, {
      order: "asc",
      limit: 1,
      run_id: run.id,
    });
    // console.log("messages?.data----->", messages?.data);
    const lastMessage = messages?.data?.[0];
    const content = lastMessage?.content?.[0];
    if (content?.type === "text" && lastMessage?.role !== "user") {
      const text = content?.text?.value;
      // console.log("text----->", text);
      await sendMessage({ user: user!, userId, chatId, text });
    } else {
      await sendMessage({
        user: user!,
        userId,
        chatId,
        text: "something went wrong",
      });
    }
    res.sendStatus(200);
  } catch (error) {
    throw new RequestError(error as string, 500);
  }
}