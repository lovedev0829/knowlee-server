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
  tiktokGetAuthCodeUrl,
  tiktokAcquireTokenByCode,
} from "../lib/tiktok/tiktok.services";

import { UpdateQuery } from "mongoose";
import { ThirdPartyConfig } from "../models/third-party/ThirdPartyConfig.model";
import { encryptData } from "../utils/encryption";

export async function tiktokAuthCallbackController(req: Request, res: Response) {
  try {
    console.log("req.query----->", req.query);
    const { code, state } = req.query;
    const { userId = "" } = JSON.parse(state as string);
    if (!userId) throw new Error("UserId not present in state");

    const user = await findUser({ id: userId });
    if (!user) throw new Error("User not found");

    const tokens = await tiktokAcquireTokenByCode({ code: code as string });
    console.log("Tokens received----->", tokens);

    const updateObject: UpdateQuery<ThirdPartyConfig> = {};

    for (const key in tokens) {
      let value = tokens[key as keyof typeof tokens];
      if (KEYS_TO_ENCRYPT.includes(key) && typeof value === "string") {
        value = encryptData(value);
        console.log(`Encrypted ${key}: `, value);
      }
      updateObject[`tiktok.token.${key}`] = value;
    }

    console.log("Update object prepared----->", updateObject);

    const updatedConfig = await findOneAndUpdateThirdPartyConfig(
      { userId: userId },
      updateObject,
      {
        upsert: true,
        new: true,
      }
    );

    console.log("Database update result----->", updatedConfig);
    res.redirect(absoluteUrl("/knowledge-sources"));
  } catch (error) {
    console.error("Failed in tiktokAuthCallbackController:", error as any as any);
    sendResponse(res, 500, "failure", { error: toString() });
  }
}

export async function tiktokLoginController(req: Request, res: Response) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;
  
  const authURL = await tiktokGetAuthCodeUrl({ userId });

  return sendResponse(res, 200, "success", { authURL: authURL });
}