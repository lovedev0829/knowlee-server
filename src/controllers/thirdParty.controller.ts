import { Request, Response } from "express";
import { sendResponse } from "../utils/response.utils";
import { RequestError } from "../utils/globalErrorHandler";
import {
  findOneAndUpdateThirdPartyConfig,
  findOneThirdPartyConfig,
  rotateEncryptionKey,
} from "../services/thirdPartyConfig.services";
import {
  getGoogleOAuth2ClientOfUser,
  googleRefreshAccessToken,
} from "../lib/google/google.services";
import { UpdateQuery } from "mongoose";
import { ThirdPartyConfig } from "../models/third-party/ThirdPartyConfig.model";
import { encryptData } from "../utils/encryption";

export async function getThirdPartyConfigController(
  req: Request,
  res: Response
) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;

  const config = await findOneThirdPartyConfig({ userId: userId });
  const expiryDate = config?.google?.token?.expiry_date;

  // let user_id = null;
  // let expiry_date = null;
  // let refreshToken = null;
  // if (config) {
  //   user_id = config.userId;
  //   expiry_date = config?.google?.token?.expiry_date;
  //   refreshToken = config?.google?.token?.refresh_token;
  // }

  // // Check if the Google token has expired
  // if (expiry_date < Date.now()) {
  //   console.log("\n INSIDE EXPIRY CHECK \n");
  //   const updateObject: UpdateQuery<ThirdPartyConfig> = {};

  //   // refresh the token.
  //   const accessToken = googleRefreshAccessToken({ refreshToken });

  //   // update the token in DB
  //   if (accessToken) {
  //     updateObject[`google.token.access_token`] = accessToken;
  //     updateObject["google.token.expiry_date"] = Date.now() + 3600000;
  //   }

  //   await findOneAndUpdateThirdPartyConfig({ userId: user_id }, updateObject, {
  //     upsert: true,
  //     new: true,
  //   });
  // }

  try {
  if (expiryDate && expiryDate < Date.now()) {
    const auth = await getGoogleOAuth2ClientOfUser({ userId: userId });
    const { credentials } = await auth.refreshAccessToken();

    const updateObject: UpdateQuery<ThirdPartyConfig> = {};

    updateObject[`google.token.access_token`] = encryptData(credentials.access_token!);
    updateObject["google.token.expiry_date"] = credentials.expiry_date;

    const updatedObj = await findOneAndUpdateThirdPartyConfig(
      { userId },
      updateObject,
      {
        upsert: true,
        new: true,
      }
    );
    return sendResponse(res, 200, "success", updatedObj);
  }
  } catch (error: any) {
    // console.log("error refreshing google accesstoken----->", error?.message);   
  }

  return sendResponse(res, 200, "success", config);
}

export async function saveOpenAIAPIKeyController(req: Request, res: Response) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;

  const { apiKey } = req.body;

  // if (!apiKey) throw new RequestError("apiKey is required", 400);

  const updateObject: UpdateQuery<ThirdPartyConfig> = {};
  updateObject["openai.apiKey"] = encryptData(apiKey);
  updateObject["openai.updatedAt"] = Date.now();

  // update medium token in database
  await findOneAndUpdateThirdPartyConfig({ userId: userId }, updateObject, {
    upsert: true,
    new: true,
  });

  return sendResponse(res, 200, "success");
}

export async function rotateEncryptionKeyController(
  req: Request,
  res: Response
) {
  const { secret_key, secret_iv } = req.body;
  if (!secret_key) throw new RequestError("secret_key is required", 400);
  if (!secret_iv) throw new RequestError("secret_iv is required", 400);
  await rotateEncryptionKey({
    secret_key: secret_key,
    secret_iv: secret_iv,
  });
  return sendResponse(res, 200, "success");
}
