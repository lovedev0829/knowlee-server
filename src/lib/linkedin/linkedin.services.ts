import axios from "axios";

export const LINKEDIN_API_BASE_URL = "https://api.linkedin.com/v2";

export type LinkedInMemberDetail = {
  email: string;
  email_verified: boolean;
  family_name: string;
  given_name: string;
  locale: { country: string, language: string };
  name: string;
  picture: string;
  sub: string;
}

export type LinkedInTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  scope: string;
  token_type: string;
  id_token: string;
};

const SERVER_BASE_URL = process.env.SERVER_BASE_URL!;
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID!;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET!;

const scope = "openid profile w_member_social email";

// replace 127.0.0.1 with localhost
// linkedin redirect URI does not support 127.0.0.1
const redirectUri = `${SERVER_BASE_URL?.replace(
  "127.0.0.1",
  "localhost"
)}/api/third-party/linkedin/auth/callback`;

export async function linkedInGetAuthCodeUrl({ userId }: { userId: string }) {
  return `https://www.linkedin.com/oauth/v2/authorization?client_id=${LINKEDIN_CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}&state={"userId":"${userId}"}`;
}

export async function linkedInAcquireTokenByCode({ code }: { code: string }) {
  const data = new URLSearchParams();
  data.append("client_id", LINKEDIN_CLIENT_ID);
  data.append("code", code);
  data.append("redirect_uri", redirectUri);
  data.append("client_secret", LINKEDIN_CLIENT_SECRET);
  data.append("grant_type", "authorization_code");
  data.append("scope", scope);

  const response = await axios.post<LinkedInTokenResponse>(
    `https://www.linkedin.com/oauth/v2/accessToken`,
    data,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return response.data;
}

// not working in our case as our app is not allowed and not getting Refresh Token
export async function linkedInRefreshAccessToken({
  refreshToken,
}: {
  refreshToken: string;
}) {
  const data = new URLSearchParams();
  data.append("client_id", LINKEDIN_CLIENT_ID);
  data.append("client_secret", LINKEDIN_CLIENT_SECRET);
  data.append("grant_type", "refresh_token");
  data.append("refresh_token", refreshToken);
  data.append("scope", scope);

  const response = await axios.post<LinkedInTokenResponse>(
    `https://www.linkedin.com/oauth/v2/accessToken`,
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

export async function linkedInRetrieveMemberDetails({
  accessToken,
}: {
  accessToken: string;
}) {
  const response = await axios.get<LinkedInMemberDetail>(
    `${LINKEDIN_API_BASE_URL}/userinfo`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
}
