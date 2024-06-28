import { WebClient } from '@slack/web-api';
import { RequestError } from '../utils/globalErrorHandler';
import { sendResponse } from '../utils/response.utils';
import { Request, Response } from 'express';
import { slackAcquireTokenByCode, slackGetAuthCodeUrl } from '../lib/slack/slack.services';
import { absoluteUrl } from '../lib/utils';
import { findUser } from '../services/user.services';
import { UpdateQuery } from 'mongoose';
import { ThirdPartyConfig } from '../models/third-party/ThirdPartyConfig.model';
import {
  KEYS_TO_ENCRYPT,
  findOneAndUpdateThirdPartyConfig,
} from "../services/thirdPartyConfig.services";
import { encryptData } from '../utils/encryption';

export async function slackLoginController(req: Request, res: Response) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;

  const authURL = await slackGetAuthCodeUrl({ userId });
  // console.log("authURL --->>> ", authURL);

  return sendResponse(res, 200, "success", { authURL: authURL });
}

export async function slackAuthCallbackController(
  req: Request,
  res: Response
) {
  try {
    // console.log("req.query----->", req.query);
    const { code, state } = req.query;
    // console.log("CODE === >>> ", code);
    // console.log("STATE === >>> ", state);

    const { userId = "" } = JSON.parse(state as string);
    if (!userId) throw new Error("UserId not present in state");

    const user = await findUser({ id: userId });
    if (!user) throw new Error("User not found");

    const tokens = await slackAcquireTokenByCode({ code: code as string });

    const updateObject: UpdateQuery<ThirdPartyConfig> = {};

    for (const key in tokens) {
      let value = tokens[key as keyof typeof tokens];
      if (KEYS_TO_ENCRYPT.includes(key) && typeof value === "string") {
        value = encryptData(value);
      }
      updateObject[`slack.token.${key}`] = value;
    }
    // update updatedAt value to current value
    updateObject[`slack.token.updatedAt`] = Date.now();

    // update slack token in database
    await findOneAndUpdateThirdPartyConfig({ userId: userId }, updateObject, {
      upsert: true,
      new: true,
    });

    res.redirect(absoluteUrl("/knowledge-sources"));
  } catch (error) {
    throw new RequestError(error as string, 500);
  }
}