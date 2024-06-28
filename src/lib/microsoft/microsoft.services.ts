import axios from "axios";
import { RequestError } from "../../utils/globalErrorHandler";

import {
  findOneThirdPartyConfig,
} from "../../services/thirdPartyConfig.services";

export type MicrosoftTokenResponse = {
  access_token: string;
  expires_in: number;
  ext_expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
};

const SERVER_BASE_URL = process.env.SERVER_BASE_URL!;
const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID!;
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET!;
const MICROSOFT_GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0";

const scope = [
  "files.read",
  "files.read.all",
  "offline_access",
  "Mail.Send",
  "Mail.ReadBasic",
  "Mail.ReadWrite",
  "Mail.Read",
  "Calendars.Read",
  "Calendars.Read.Shared",
  "Calendars.ReadBasic",
  "Calendars.ReadWrite",
  "Calendars.ReadWrite.Shared",
  "Notes.Create",
  "Notes.Read",
  "Notes.Read.All",
  "Notes.ReadWrite",
  "Notes.ReadWrite.All",
  "Notes.ReadWrite.CreatedByApp",
  "Team.ReadBasic.All",
  "TeamMember.Read.All",
  "ChannelMember.Read.All",
  "Channel.ReadBasic.All",
  "Chat.Create",
  "ChannelMessage.Send"
];


// replace 127.0.0.1 with localhost
// microsoft redirect URI does not support 127.0.0.1
const redirectUri = `${SERVER_BASE_URL?.replace(
  "127.0.0.1",
  "localhost"
)}/api/third-party/microsoft/auth/callback`;

export async function microsoftGetAuthCodeUrl({ userId }: { userId: string }) {
  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${MICROSOFT_CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}&state={"userId":"${userId}"}`;
}

export async function microsoftAcquireTokenByCode({ code }: { code: string }) {
  const data = new URLSearchParams();
  data.append("client_id", MICROSOFT_CLIENT_ID);
  data.append("code", code);
  data.append("redirect_uri", redirectUri);
  data.append("client_secret", MICROSOFT_CLIENT_SECRET);
  data.append("grant_type", "authorization_code");
  data.append("scope", scope.join(" "));

  const response = await axios.post<MicrosoftTokenResponse>(
    `https://login.microsoftonline.com/common/oauth2/v2.0/token`,
    data,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return response.data;
}

export async function downloadContentsOfOneDriveItem({
  itemId,
  accessToken,
}: {
  itemId: string;
  accessToken: string;
}) {
  const response = await axios.get(
    `${MICROSOFT_GRAPH_BASE_URL}/me/drive/items/${itemId}/content`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      responseType: "arraybuffer",
    }
  );
  return response;
}

export async function microsoftRefreshAccessToken({
  refreshToken,
}: {
  refreshToken: string;
}) {
  const data = new URLSearchParams();
  data.append("client_id", MICROSOFT_CLIENT_ID);
  data.append("client_secret", MICROSOFT_CLIENT_SECRET);
  data.append("grant_type", "refresh_token");
  data.append("refresh_token", refreshToken);
  data.append("scope", scope.join(" "));

  const response = await axios.post<MicrosoftTokenResponse>(
    `https://login.microsoftonline.com/common/oauth2/v2.0/token`,
    data,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  // console.log("token----->", response.data);
  return response.data;
}

// Get Microsoft Access Token from Authenticated User
export async function getMicrosoftTokenOfUser({
  userId,
}: {
  userId: string;
}) {
   const thirdPartyConfig = await findOneThirdPartyConfig({ userId: userId });
   if (!thirdPartyConfig) {
      throw new RequestError("Not Authorized: No third party config found");
   }

   const microsoftToken = thirdPartyConfig?.microsoft?.token;

   if (!microsoftToken) {
      throw new RequestError("Not Authorized: No microsoft token found");
   }

   // request new access token every time to make sure token is valid
   const token = await microsoftRefreshAccessToken({
      refreshToken: microsoftToken.refresh_token,
   });
   
   return token
}

