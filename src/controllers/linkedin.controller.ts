import { Request, Response } from "express";
import { sendResponse } from "../utils/response.utils";
import { RequestError } from "../utils/globalErrorHandler";
import { findUser } from "../services/user.services";
import {
  KEYS_TO_ENCRYPT,
  findOneAndUpdateThirdPartyConfig,
} from "../services/thirdPartyConfig.services";
import { absoluteUrl } from "../lib/utils";
import {
  linkedInAcquireTokenByCode,
  linkedInGetAuthCodeUrl,
  linkedInRetrieveMemberDetails,
} from "../lib/linkedin/linkedin.services";
import { UpdateQuery } from "mongoose";
import { ThirdPartyConfig } from "../models/third-party/ThirdPartyConfig.model";
import { encryptData } from "../utils/encryption";

export async function linkedInAuthCallbackController(
  req: Request,
  res: Response
) {
  try {
    // console.log("req.query----->", req.query);
    const { code, state } = req.query;
    const { userId = "" } = JSON.parse(state as string);
    if (!userId) throw new Error("UserId not present in state");

    const user = await findUser({ id: userId });
    if (!user) throw new Error("User not found");

    const tokens = await linkedInAcquireTokenByCode({ code: code as string });
    // console.log("response----->", tokens);

    const updateObject: UpdateQuery<ThirdPartyConfig> = {};

    for (const key in tokens) {
      let value = tokens[key as keyof typeof tokens];
      if (KEYS_TO_ENCRYPT.includes(key) && typeof value === "string") {
        value = encryptData(value);
      }
      updateObject[`linkedin.token.${key}`] = value;
    }
    // update updatedAt value to current value
    updateObject[`linkedin.token.updatedAt`] = Date.now();

    // get LinkedIn userInfo
    const linkedInUserInfo = await linkedInRetrieveMemberDetails({
      accessToken: tokens.access_token,
    });
    updateObject[`linkedin.userInfo`] = linkedInUserInfo;

    // update linkedin token in database
    await findOneAndUpdateThirdPartyConfig({ userId: userId }, updateObject, {
      upsert: true,
      new: true,
    });
    res.redirect(absoluteUrl("/knowledge-sources"));
  } catch (error) {
    throw new RequestError(error as string, 500);
  }
}

export async function linkedInLoginController(req: Request, res: Response) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;

  const authURL = await linkedInGetAuthCodeUrl({ userId });

  return sendResponse(res, 200, "success", { authURL: authURL });
}
