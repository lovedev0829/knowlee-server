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
  microsoftGetAuthCodeUrl,
  microsoftAcquireTokenByCode,
} from "../lib/microsoft/microsoft.services";
import { UpdateQuery } from "mongoose";
import { ThirdPartyConfig } from "../models/third-party/ThirdPartyConfig.model";
import { encryptData } from "../utils/encryption";

export async function microsoftAuthCallbackController(
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

    const tokens = await microsoftAcquireTokenByCode({ code: code as string });
    // console.log("response----->", tokens);

    const updateObject: UpdateQuery<ThirdPartyConfig> = {};
  
    for (const key in tokens) {
      let value = tokens[key as keyof typeof tokens];
      if (KEYS_TO_ENCRYPT.includes(key) && typeof value === "string") {
        value = encryptData(value);
      }
      updateObject[`microsoft.token.${key}`] = value;
    }

    // update microsoft token in database
    await findOneAndUpdateThirdPartyConfig(
      { userId: userId },
      updateObject,
      {
        upsert: true,
        new: true,
      }
    );
    res.redirect(absoluteUrl("/knowledge-sources"));
  } catch (error) {
    throw new RequestError(error as string, 500);
  }
}

export async function microsoftLoginController(req: Request, res: Response) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;

  const authURL = await microsoftGetAuthCodeUrl({ userId });

  return sendResponse(res, 200, "success", { authURL: authURL });
}
