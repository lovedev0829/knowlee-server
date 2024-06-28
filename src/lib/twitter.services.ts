import Client, { auth } from "twitter-api-sdk";
import { Token } from "../types/twitter.type";
import { findOneAndUpdateTwitterConfig } from "../services/twitterConfig.services";

const client_id = process.env.TWITTER_CLIENT_ID!;
const client_secret = process.env.TWITTER_CLIENT_SECRET!;
const SERVER_BASE_URL = process.env.SERVER_BASE_URL!;
export const TWITTER_BASE_URL = "https://api.twitter.com/2";

export const TWITTER_STATE = "my-state";
export const MAX_TWEET_LENGTH = 280;

const authClient = new auth.OAuth2User({
  client_id: client_id,
  client_secret: client_secret,
  callback: `${SERVER_BASE_URL}/api/third-party/twitter/auth/callback`,
  scopes: [
    "tweet.read",
    "users.read",
    "offline.access",
    "tweet.write",
    "tweet.moderate.write",
  ],
});

export async function createTweet(
  token: Token,
  { userId, text, title }: { userId: string; text: string; title?: string }
) {
  const authClient = new auth.OAuth2User({
    client_id: client_id,
    client_secret: client_secret,
    callback: `${SERVER_BASE_URL}/api/third-party/twitter/auth/callback?userId=${userId}`,
    scopes: [
      "tweet.read",
      "users.read",
      "offline.access",
      "tweet.write",
      "tweet.moderate.write",
    ],
    token: token,
  });
  try {
    if (authClient.isAccessTokenExpired()) {
      const { token: newToken } = await authClient.refreshAccessToken();
      // console.log("newToken----->", newToken);
      await findOneAndUpdateTwitterConfig(
        { userId: userId },
        { token: newToken },
        { upsert: true, new: true }
      );
    }

    const client = new Client(authClient);
    const tweets = [];
    let remainingContent = text;

    if (title?.length) {
      tweets.push(title.substring(0, MAX_TWEET_LENGTH));
    }

    // Split the content into tweets
    // Assuming 'text' contains the full contentData, possibly with delimiters for threads
    let contentSegments = text.split("|||"); // Split the text by the delimiter

    for (let segment of contentSegments) {
      segment = segment.trim(); // Trim whitespace from each segment

      if (segment.length <= MAX_TWEET_LENGTH) {
        // If the segment is within the character limit, add it directly
        // console.log("segment----->", segment);
        tweets.push(segment);
      } else {
        // If the segment exceeds the character limit, split it into smaller tweets
        let remainingSegment = segment;

        while (remainingSegment.length > 0) {
          let endIndex = remainingSegment.lastIndexOf(" ", MAX_TWEET_LENGTH);

          const tweet = endIndex !== -1 ? remainingSegment.substring(0, endIndex) : remainingSegment.substring(0, MAX_TWEET_LENGTH);
          remainingSegment = remainingSegment.substring(tweet.length).trim();
          // console.log("remainingSegment----->", remainingSegment);
          tweets.push(tweet);
        }
      }
    }


    const postedTweets: {
      id: string;
      text: string;
    }[] = [];

    for (const text of tweets) {
      // Retrieve the last sent tweet
      const lastTweet = postedTweets.length
        ? postedTweets[postedTweets.length - 1]
        : null;

      // console.log("lastTweet.id------>", lastTweet?.id);

      const request_body: {
        text: string;
        reply?: {
          in_reply_to_tweet_id: string;
        };
      } = { text: text };
      if (lastTweet) {
        request_body.reply = { in_reply_to_tweet_id: lastTweet.id };
      }
      const res = await client.tweets.createTweet(request_body);
      // console.log("request_body----->", request_body);
      // console.log("res.data----->", res.data);
      if (res.data) {
        postedTweets.push(res.data);
      }
    }
    return postedTweets;
  } catch (error) {
    const twitterError = error as {
      error: {
        detail?: string;
        error_description?: string;
        error: string;
        errors?: string[];
      };
    };
    // const errorDetail = twitterError?.error?.detail;
    // const errorDescription = twitterError?.error?.error_description;
    // const errors = twitterError?.error?.errors;
    // console.log(
    //   "twitterError----->",
    //   errorDetail,
    //   errorDescription,
    //   JSON.stringify(errors)
    // );
    // console.log((error as { error: { detail: string } })?.error?.detail);
    // console.log(error);
    throw new Error(error as string);
  }
}
