import { OAuth, oauth1tokenCallback } from "oauth";

const SERVER_BASE_URL = process.env.SERVER_BASE_URL!;
const TRELLO_API_KEY = process.env.TRELLO_API_KEY!;
const TRELLO_API_SECRET = process.env.TRELLO_API_SECRET!;
export const TRELLO_API_BASE_URL = "https://api.trello.com/1";

const return_url = `${SERVER_BASE_URL}/api/third-party/trello/auth/callback`;
// const callback_method: "postMessage" | "fragment" = "fragment";
// const name = "Knowlee";
// const response_type: "token" | "fragment" = "token";

const requestURL = "https://trello.com/1/OAuthGetRequestToken";
const accessURL = "https://trello.com/1/OAuthGetAccessToken";

const oauth = new OAuth(
  requestURL,
  accessURL,
  TRELLO_API_KEY,
  TRELLO_API_SECRET,
  "1.0A",
  return_url,
  "HMAC-SHA1"
);

// export async function trelloGetAuthLoginUrl({ userId }: { userId: string }) {
//   return `https://trello.com/1/authorize?return_url=${return_url}&callback_method=${callback_method}&scope=${scope}&expiration=${expiration}&name=${name}&key=${TRELLO_API_KEY}&response_type=${response_type}&userId=${userId}`;
// }

export async function trelloGetOAuthRequestToken(
  callback: oauth1tokenCallback
) {
  oauth.getOAuthRequestToken(callback);
}

export async function trelloGetOAuthAccessToken(
  oauth_token: string,
  oauth_token_secret: string,
  oauth_verifier: string,
  callback: oauth1tokenCallback
) {
  oauth.getOAuthAccessToken(
    oauth_token,
    oauth_token_secret,
    oauth_verifier,
    callback
  );
}
