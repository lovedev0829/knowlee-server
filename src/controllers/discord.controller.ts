import { Request, Response } from "express";
import { sendResponse } from "../utils/response.utils";
import { RequestError } from "../utils/globalErrorHandler";
import { findUser } from "../services/user.services";
import { findOneAndUpdateThirdPartyConfig } from "../services/thirdPartyConfig.services";
import { absoluteUrl } from "../lib/utils";
import {
  discordGetAuthCodeUrl,
  discordAcquireTokenByCode,
  discordRetrieveUserInfo,
} from "../lib/discord/discord.services";
import { UpdateQuery } from "mongoose";
import { ThirdPartyConfig } from "../models/third-party/ThirdPartyConfig.model";
import { encryptData } from "../utils/encryption";

export async function discordAuthCallbackController(
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

    const tokens = await discordAcquireTokenByCode({ code: code as string });
    // console.log("response----->", tokens);

    // update discord token in database
    await findOneAndUpdateThirdPartyConfig(
      { userId: userId },
      { "discord.token": tokens },
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

export async function discordLoginController(req: Request, res: Response) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;

  const authURL = await discordGetAuthCodeUrl({ userId });

  return sendResponse(res, 200, "success", { authURL: authURL });
}

export async function addDiscordAccessTokenController(req: Request, res: Response) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;

  const { accessToken, serverId } = req.body;

  if (!accessToken) throw new RequestError("Access Token is required", 400);

  const updateObject: UpdateQuery<ThirdPartyConfig> = {};

  // get discord userInfo
  // const discordUserInfo = await discordRetrieveUserInfo({
  //   accessToken,
  // });

  // if (!discordUserInfo) throw new RequestError("Invalid access token", 400);

  // updateObject[`discord.userInfo`] = discordUserInfo;
  updateObject[`discord.token.access_token`] = encryptData(accessToken);
  updateObject[`discord.serverId`] = serverId;
  updateObject[`discord.token.updatedAt`] = Date.now();

  // update discord token in database
  await findOneAndUpdateThirdPartyConfig(
    { userId: userId },
    updateObject,
    {
      upsert: true,
      new: true,
    }
  );
  
  return sendResponse(res, 200, "success", {});
}
