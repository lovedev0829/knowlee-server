import axios from "axios";
import { Auth, google } from "googleapis";
import { findOneThirdPartyConfig } from "../../services/thirdPartyConfig.services";

const clientId = process.env.GOOGLE_CLIENT_ID!;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
const SERVER_BASE_URL = process.env.SERVER_BASE_URL!;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;

const googleOAauth2Client = new google.auth.OAuth2({
  clientId: clientId,
  clientSecret: clientSecret,
  redirectUri: `${SERVER_BASE_URL}/api/third-party/google/auth/callback`,
});

export async function generateGoogleAuthUrl({ userId }: { userId: string }) {
  // generate a url that asks permissions
  const url = googleOAauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/calendar", 
      "https://www.googleapis.com/auth/drive.file",
      // "https://www.googleapis.com/auth/gmail.send",
      // "https://www.googleapis.com/auth/gmail.addons.current.message.action",
      "https://mail.google.com/",
      // 'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.upload',    
      'https://www.googleapis.com/auth/youtube.download'    
      // "https://www.googleapis.com/auth/keep"
    ],
    state: JSON.stringify({ userId: userId }),
    include_granted_scopes: true,
  });
  return url;
}

export async function getGoogleAuthToken({ code }: { code: string }) {
  return await googleOAauth2Client.getToken(code);
}

export async function googleRefreshAccessToken({
  refreshToken,
}: {
  refreshToken: string;
}) {
  const data = new URLSearchParams();
  data.append("client_id", clientId);
  data.append("client_secret", clientSecret);
  data.append("grant_type", "refresh_token");
  data.append("refresh_token", refreshToken);

  const response = await axios.post(
    `https://oauth2.googleapis.com/token`,
    data,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  // console.log("token----->", response.data);
  return response;
}

export function getGoogleOAuth2Client({
  credentials,
}: {
  credentials: Auth.Credentials;
}) {
  const googleOAauth2Client = new google.auth.OAuth2({
    clientId: clientId,
    clientSecret: clientSecret,
    redirectUri: `${SERVER_BASE_URL}/api/third-party/google/auth/callback`,
    credentials: credentials,
  });
  return googleOAauth2Client;
}

export async function getGoogleOAuth2ClientOfUser({
  userId,
}: {
  userId: string;
}) {
  const thirdPartyConfig = await findOneThirdPartyConfig({ userId: userId });
  if (!thirdPartyConfig) {
    throw new Error("Not Authorized: No third party config found");
  }
  const googleToken = thirdPartyConfig?.google?.token;
  if (!googleToken) {
    throw new Error("Not Authorized: No google token found");
  }
  const auth = getGoogleOAuth2Client({ credentials: googleToken });
  return auth;
}

export async function generateExportUrl({
  docId,
  docType,
}: {
  docId: string;
  docType: string;
}) {
  let exportMimeType = "text/plain"; // Default mimeType for documents and presentations
  if (docType === "application/vnd.google-apps.spreadsheet") {
    exportMimeType = "text/csv"; // mimeType for sheets
  }

  const url = `https://www.googleapis.com/drive/v3/files/${docId}/export?mimeType=${encodeURIComponent(
    exportMimeType
  )}&key=${GOOGLE_API_KEY}&alt=media`;

  return url;
}