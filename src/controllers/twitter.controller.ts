import { Request, Response } from "express";
import { sendResponse } from "../utils/response.utils";
import { auth } from "twitter-api-sdk";
import { absoluteUrl } from "../lib/utils";
import { RequestError } from "../utils/globalErrorHandler";
import {
  findOneAndUpdateTwitterConfig,
  findOneTwitterConfig,
} from "../services/twitterConfig.services";
import axios from "axios";
import { TWITTER_BASE_URL } from "../lib/twitter.services";
import {
  KEYS_TO_ENCRYPT,
  findOneAndUpdateThirdPartyConfig,
} from "../services/thirdPartyConfig.services";
import { UpdateQuery } from "mongoose";
import { ThirdPartyConfig } from "../models/third-party/ThirdPartyConfig.model";
import { encryptData } from "../utils/encryption";

const client_id = process.env.TWITTER_CLIENT_ID!;
const client_secret = process.env.TWITTER_CLIENT_SECRET!;
const SERVER_BASE_URL = process.env.SERVER_BASE_URL!;

const STATE = "my-state";

const authClient = new auth.OAuth2User({
  client_id: client_id,
  client_secret: client_secret,
  // callback: `${SERVER_BASE_URL}/api/third-party/twitter/auth/callback`,
  callback: `${SERVER_BASE_URL}/api/third-party/twitter/auth/callback`,
  scopes: [
    "tweet.read",
    "users.read",
    "offline.access",
    "tweet.write",
    "tweet.moderate.write",
  ],
});

export async function twitterAuthCallbackController(
  req: Request,
  res: Response
) {
  try {
    const { code, state, userId } = req.query;
    // console.log("req.query----->", req.query);
    if (state !== STATE) return res.status(500).send("State isn't matching");

    // const { token } = await authClient.requestAccessToken(code as string);
    // console.log("token----->", token);

    const data = new URLSearchParams();
    data.append("code", code as string);
    data.append("grant_type", "authorization_code");
    data.append("client_id", client_id);
    data.append("client_secret", client_secret);
    data.append(
      "redirect_uri",
      `${SERVER_BASE_URL}/api/third-party/twitter/auth/callback?userId=${userId}`
    );
    data.append("code_verifier", "code_challenge");

    const response = await axios.post(
      `${TWITTER_BASE_URL}/oauth2/token`,
      data,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${client_id}:${client_secret}`
          ).toString("base64")}`,
        },
      }
    );
    // console.log("token----->", response.data);

    const token = response.data;

    // await findOneAndUpdateTwitterConfig(
    //   { userId: userId },
    //   { token: response.data },
    //   { upsert: true, new: true }
    // );

    const updateObject: UpdateQuery<ThirdPartyConfig> = {};
  
    for (const key in token) {
      let value = token[key as keyof typeof token];
      if (KEYS_TO_ENCRYPT.includes(key) && typeof value === "string") {
        value = encryptData(value);
      }
      updateObject[`twitter.token.${key}`] = value;
    }
    updateObject.updatedAt = Date.now();

    // update twitter token in database
    await findOneAndUpdateThirdPartyConfig(
      { userId: userId },
      updateObject,
      {
        upsert: true,
        new: true,
      }
    );

    // res.redirect(absoluteUrl(""));
    // return sendResponse(res, 200, "Authorization successful");
    res.redirect(absoluteUrl("/knowledge-sources"));
  } catch (error) {
    // console.log(error);
    const twitterError = error as {
      error: { detail?: string; error_description?: string; error: string };
    };
    const errorDetail = twitterError?.error?.detail;
    const errorDescription = twitterError?.error?.error_description;
    // console.log("twitterError----->", errorDetail, errorDescription);

    throw new RequestError(twitterError?.error?.error, 500);
  }
}

export async function twitterLoginController(req: Request, res: Response) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;

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
  });

  const authURL = authClient.generateAuthURL({
    state: STATE,
    // code_challenge_method: "s256",
    code_challenge_method: "plain",
    code_challenge: "code_challenge",
  });
  // console.log("authURL----->", authURL);
  return sendResponse(res, 200, "success", { authURL: authURL });
}

export async function getTwitterConfigController(req: Request, res: Response) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;

  const twitterConfig = await findOneTwitterConfig({ userId: userId });
  return sendResponse(res, 200, "success", twitterConfig);
}
