import axios from "axios";
import { RequestError } from "../../utils/globalErrorHandler";
import {
  findOneThirdPartyConfig,
} from "../../services/thirdPartyConfig.services";
import { Thread } from "openai/resources/beta/threads/threads";
import { openAIThreadsCreate } from "../../services/openAI.services";
import TelegramThreadModel, { ITelegramThreadDocument } from "../../models/telegram/TelegramThread.model";
import { FilterQuery, UpdateQuery } from "mongoose";
import { ProjectionType } from "mongoose";
import { QueryOptions } from "mongoose";
import { TelegramUser } from "../../types/telegram.types";

const SERVER_BASE_URL = process.env.SERVER_BASE_URL!;
const TELEGRAM_CLIENT_ID = process.env.TELEGRAM_CLIENT_ID!;
const TELEGRAM_CLIENT_SECRET = process.env.TELEGRAM_CLIENT_SECRET!;
const TELEGRAM_BASE_URL = "https://telegram.com/api/v10";
const TELEGRAM_URL = "https://api.telegram.org/";

// Replace 127.0.0.1 with localhost for redirect URI
const redirectUri = `${SERVER_BASE_URL?.replace(
  "127.0.0.1",
  "localhost"
)}/api/third-party/telegram/auth/callback`;

// Generate Telegram authorization URL
export async function telegramGetAuthCodeUrl({ userId }: { userId: string }) {
  return `https://telegram.com/oauth2/authorize?client_id=${TELEGRAM_CLIENT_ID}&response_type=code&scope=identify%20guilds.join&redirect_uri=${redirectUri}&state={"userId":"${userId}"}&prompt=consent`;
}

// Exchange authorization code for access token
export async function telegramAcquireTokenByCode({ code }: { code: string }) {
  const encoded = Buffer.from(`${TELEGRAM_CLIENT_ID}:${TELEGRAM_CLIENT_SECRET}`).toString("base64");

  const response = await fetch("https://telegram.com/api/v10/oauth2/token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${encoded}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new RequestError(data.error_description || "Failed to acquire token");
  }
  
  return { access_token: data.access_token, refresh_token: data.refresh_token };
}

// Get token for a user by user ID
  export async function getUserAccessToken({
    userId,
  }: {
    userId: string;
  }) {
     const thirdPartyConfig = await findOneThirdPartyConfig({ userId: userId });
     if (!thirdPartyConfig) {
        throw new RequestError("Not Authorized: No third party config found");
     }
  
    const telegramToken = thirdPartyConfig?.telegram?.token?.access_token;
    
     if (!telegramToken) {
        throw new RequestError("Not Authorized: No telegram token found");
     }
  
     // request new access token every time to make sure token is valid
    //  const token = await microsoftRefreshAccessToken({
    //     refreshToken: telegramToken.refresh_token,
    //  });
     
     return telegramToken
  }
  
// Handle HTTP GET request
export const handleHttpGet = async({
  accessToken,
  httpURL,
}: {
  accessToken: string,
  httpURL: string,
}) => {
  const response = await axios.get(
    `${TELEGRAM_BASE_URL}/${httpURL}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
    }
  );

  return response?.data;
}

// Handle HTTP POST request
export const handleHttpPost = async({
  accessToken,
  httpURL,
  httpMethod,
  ...params
}: {
  accessToken: string,
  httpURL: string,
  httpMethod: string,
}) => {
  const response = await axios.request({
    method: httpMethod,
    url: `${TELEGRAM_BASE_URL}/${httpURL}`,
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    data: params
  });

  return response?.data;
}

// Retrieve Telegram user info
export async function telegramRetrieveUserInfo({
  accessToken,
}: {
  accessToken: string
}) {
  const response = await axios.get(
    `${TELEGRAM_BASE_URL}/users/@me`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
}

export async function getBotInfo({
  botToken,
}: {
  botToken: string
}) {
  try {
    const getMeUrl = `${TELEGRAM_URL}bot${botToken}/getMe`;
    const response = await axios.get(getMeUrl);
    const botInfo = response.data;

    if (botInfo && botInfo.ok) {
      return botInfo?.result as TelegramUser;
    } else {
      throw new Error("Failed to retrieve bot info");
    }
  } catch (error) {
    throw error;
  }
}

export async function createTelegramThread({ userId, chat_id, from_id, botId }: {
  userId: string,
  chat_id: string,
  from_id: string,
  botId: string,
}) {
  
  if (!userId) throw new RequestError("Could not verify user", 401);
  const thread: Thread = await openAIThreadsCreate()
  
  // NOTE : increment userThreadCount - if we want to add telegram thread count for users then un-comment this below lines
  // await findOneAndUpdateUserUsageStatDocument(
  //   { userId: userId },
  //   { $inc: { "userThreadCount": 1 }, },
  //   { upsert: true, new: true }
  // );

  const dbTelegramThread = new TelegramThreadModel({
    chat_id,
    from_id,
    botId,
    creatorId: userId,
    thread: {
      id: thread.id,
      created_at: thread.created_at,
      metadata: thread.metadata,
      object: thread.object
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  const createdThread = await dbTelegramThread.save()
  return createdThread;
}

export async function findTelegramThreadDocuments(
  filter: FilterQuery<ITelegramThreadDocument>,
  projection?: ProjectionType<ITelegramThreadDocument>,
  options?: QueryOptions<ITelegramThreadDocument>
) {
  return await TelegramThreadModel.find(filter, projection, options);
}

export const findOneAndUpdateTelegramThreadDocument = async (
  filter?: FilterQuery<ITelegramThreadDocument>,
  update?: UpdateQuery<ITelegramThreadDocument>,
  options?: QueryOptions<ITelegramThreadDocument>
) => {
  return await TelegramThreadModel.findOneAndUpdate(filter, update, options);
};
