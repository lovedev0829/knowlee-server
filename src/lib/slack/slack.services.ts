import { WebClient } from '@slack/web-api';

const SERVER_BASE_URL = process.env.SERVER_BASE_URL!;
const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID!;
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET!;
const SLACK_SIGNIN_SECRET = process.env.SLACK_SIGNIN_SECRET!;

const redirectUri = process.env.DEPLOY_ENV === "production"
  ? `${SERVER_BASE_URL}/api/third-party/slack/auth/callback`
  : "https://9884-115-246-24-52.ngrok-free.app/api/third-party/slack/auth/callback";

export async function slackGetAuthCodeUrl({ userId }: { userId: string }) {
  const scopes = ['channels:history', 'channels:write', 'channels:read', 'channels:write.invites', 'channels:write.topic', 'chat:write', 'files:read', 'search:read', 'users:read', 'users:read.email', 'groups:history', 'im:history', 'mpim:history'];
  // 'chat:write:bot', 'chat:write:user' - required for update and delete but not availabe in scopes doc

  const botScopes = ['channels:history', 'channels:join', 'channels:read', 'channels:write.invites', 'channels:write.topic', 'chat:write', 'chat:write.public', 'commands', 'files:read', 'users:read', 'users:read.email', 'groups:history', 'im:history', 'mpim:history']

  return `https://slack.com/oauth/v2/authorize?client_id=${SLACK_CLIENT_ID}&scope=${botScopes.join(',')}&user_scope=${scopes.join(',')}&redirect_uri=${redirectUri}&access_type=offline&state={"userId":"${userId}"}`
}

export async function slackAcquireTokenByCode({ code }: { code: string }) {
  const slackClient = new WebClient();
  const res = await slackClient.oauth.v2.access({
    client_id: SLACK_CLIENT_ID,
    client_secret: SLACK_CLIENT_SECRET,
    code,
    redirect_uri: redirectUri,
  });
  return res;
}