import axios, { AxiosError } from "axios";
import Client, { auth } from "twitter-api-sdk";
import { User } from "../../../models/user.model";
import {
  KEYS_TO_ENCRYPT,
  findOneAndUpdateThirdPartyConfig,
  findOneThirdPartyConfig,
} from "../../thirdPartyConfig.services";
import { UpdateQuery } from "mongoose";
import { ThirdPartyConfig } from "../../../models/third-party/ThirdPartyConfig.model";
import { encryptData } from "../../../utils/encryption";

const client_id = process.env.TWITTER_CLIENT_ID!;
const client_secret = process.env.TWITTER_CLIENT_SECRET!;
const SERVER_BASE_URL = process.env.SERVER_BASE_URL!;

export const MAX_TWEET_LENGTH = 280;

export async function twitterCreateTweetFunction(
  {
    user,
    text,
    title,

  }: {
    user: User;
    text: string;
    title?: string;
  }
) {
  if (!user) return "please provide user";
  const { id: userId } = user;

  const thirdPartyConfig = await findOneThirdPartyConfig({ userId: userId });
  if (!thirdPartyConfig) {
    throw new Error("Not Authorized: No third party config found");
  }

  const token = thirdPartyConfig?.twitter?.token;

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

      const updateObject: UpdateQuery<ThirdPartyConfig> = {};

      for (const key in newToken) {
        let value = newToken[key as keyof typeof newToken];
        if (KEYS_TO_ENCRYPT.includes(key) && typeof value === "string") {
          value = encryptData(value);
        }
        updateObject[`twitter.token.${key}`] = value;
      }
      // update twitter token in database in thirdpartyconfig
      await findOneAndUpdateThirdPartyConfig({ userId: userId }, updateObject, {
        upsert: true,
        new: true,
      });
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
        tweets.push(segment);
      } else {
        // If the segment exceeds the character limit, split it into smaller tweets
        let remainingSegment = segment;

        while (remainingSegment.length > 0) {
          let endIndex = remainingSegment.lastIndexOf(" ", MAX_TWEET_LENGTH);

          const tweet =
            endIndex !== -1
              ? remainingSegment.substring(0, endIndex)
              : remainingSegment.substring(0, MAX_TWEET_LENGTH);
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
    const errorDetail = twitterError?.error?.detail;
    const errorDescription = twitterError?.error?.error_description;
    const errors = twitterError?.error?.errors;
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