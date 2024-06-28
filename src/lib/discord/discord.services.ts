import axios from "axios";
import { RequestError } from "../../utils/globalErrorHandler";
import { User } from "../../models/user.model";
import {
  findOneThirdPartyConfig,
} from "../../services/thirdPartyConfig.services";

const SERVER_BASE_URL = process.env.SERVER_BASE_URL!;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;
const DISCORD_BASE_URL = "https://discord.com/api/v10";

// Replace 127.0.0.1 with localhost for redirect URI
const redirectUri = `${SERVER_BASE_URL?.replace(
  "127.0.0.1",
  "localhost"
)}/api/third-party/discord/auth/callback`;

// Generate Discord authorization URL
export async function discordGetAuthCodeUrl({ userId }: { userId: string }) {
  return `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&response_type=code&scope=identify%20guilds.join&redirect_uri=${redirectUri}&state={"userId":"${userId}"}&prompt=consent`;
}

// Exchange authorization code for access token
export async function discordAcquireTokenByCode({ code }: { code: string }) {
  const encoded = Buffer.from(`${DISCORD_CLIENT_ID}:${DISCORD_CLIENT_SECRET}`).toString("base64");

  const response = await fetch("https://discord.com/api/v10/oauth2/token", {
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

  const discordToken = thirdPartyConfig?.discord?.token?.access_token;
  if (!discordToken) {
    throw new RequestError("Not Authorized: No discord token found");
  }

  // request new access token every time to make sure token is valid
  //  const token = await microsoftRefreshAccessToken({
  //     refreshToken: discordToken.refresh_token,
  //  });

  return discordToken
}

// Get Server ID for a user by user ID
export async function getUserServerId({
  userId,
}: {
  userId: string;
}) {
  const thirdPartyConfig = await findOneThirdPartyConfig({ userId: userId });
  if (!thirdPartyConfig) {
    throw new RequestError("Not Authorized: No third party config found");
  }

  const discordServer = thirdPartyConfig?.discord?.serverId;
  if (!discordServer) {
    throw new RequestError("Not Authorized: No discord server found");
  }

  // request new access token every time to make sure token is valid
  //  const token = await microsoftRefreshAccessToken({
  //     refreshToken: discordToken.refresh_token,
  //  });

  return discordServer
}

// Handle HTTP GET request
export const handleHttpGet = async ({
  accessToken,
  httpURL,
}: {
  accessToken: string,
  httpURL: string,
}) => {
  const response = await axios.get(
    `${DISCORD_BASE_URL}/${httpURL}`,
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
export const handleHttpPost = async ({
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
    url: `${DISCORD_BASE_URL}/${httpURL}`,
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    data: params
  });

  return response?.data;
}

// Retrieve Discord user info
export async function discordRetrieveUserInfo({
  accessToken,
}: {
  accessToken: string
}) {
  const response = await axios.get(
    `${DISCORD_BASE_URL}/users/@me`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
}
