import { Request, Response } from "express";
import { sendResponse } from "../utils/response.utils";
import { RequestError } from "../utils/globalErrorHandler";
import {
  generateExportUrl,
  generateGoogleAuthUrl,
  getGoogleAuthToken,
} from "../lib/google/google.services";
import { findUser } from "../services/user.services";
import {
  KEYS_TO_ENCRYPT,
  findOneAndUpdateThirdPartyConfig,
} from "../services/thirdPartyConfig.services";
import { UpdateQuery } from "mongoose";
import { ThirdPartyConfig } from "../models/third-party/ThirdPartyConfig.model";
import { absoluteUrl } from "../lib/utils";
import { encryptData } from "../utils/encryption";

export async function googleAuthCallbackController(
  req: Request,
  res: Response
) {
  try {
    // console.log("req.query----->", req.query);
    const { code, scope, state, error } = req.query;
    if (error) {
      return res.status(200).json({
        error: error,
        state: JSON.parse(state as string),
        message:
          "We were unable to authenticate your account with Google. Please ensure you have granted the necessary permissions and try again.",
      });
    }

    const { userId = "" } = JSON.parse(state as string);
    if (!userId) throw new Error("UserId not present in state");

    const user = await findUser({ id: userId });
    if (!user) throw new Error("User not found");

    const response = await getGoogleAuthToken({ code: code as string });
    const { tokens } = response;
    // oauth2Client.setCredentials(tokens);
    // console.log("tokens", tokens);

    const updateObject: UpdateQuery<ThirdPartyConfig> = {};

    for (const key in tokens) {
      let value = tokens[key as keyof typeof tokens];
      if (KEYS_TO_ENCRYPT.includes(key) && typeof value === "string") {
        value = encryptData(value);
      }
      updateObject[`google.token.${key}`] = value;
    }

    await findOneAndUpdateThirdPartyConfig({ userId: userId }, updateObject, {
      upsert: true,
      new: true,
    });
    // return sendResponse(res, 200, "Authorization successful");
    res.redirect(absoluteUrl("/knowledge-sources"));
  } catch (error) {
    console.error("Error during Google Auth Callback:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function googleLoginController(req: Request, res: Response) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;

  const authURL = await generateGoogleAuthUrl({ userId });

  return sendResponse(res, 200, "success", { authURL: authURL });
}

export async function generateExportUrlContentController(req: Request, res: Response) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);

  const { docId, docType } = req.body;

  const exportUrl = await generateExportUrl({ docId, docType });

  const response = await fetch(exportUrl);
  if (!response.ok) throw new Error("Failed to fetch document content.");
  const text = await response.text();

  return sendResponse(res, 200, "success", { text: text });
}
