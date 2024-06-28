import { Request, Response } from "express";
import { sendResponse } from "../utils/response.utils";
import { RequestError } from "../utils/globalErrorHandler";
import { findOneMediumConfig } from "../services/mediumConfig.services";
import { findOneAndUpdateThirdPartyConfig } from "../services/thirdPartyConfig.services";
import { mediumRetrieveMemberDetails } from "../lib/medium.services";
import { UpdateQuery } from "mongoose";
import { ThirdPartyConfig } from "../models/third-party/ThirdPartyConfig.model";
import { encryptData } from "../utils/encryption";
// import { getMediumAuthURL } from "../lib/medium.services";

export async function mediumAuthCallbackController(
  req: Request,
  res: Response
) {
  try {
    const { code, state, userId } = req.query;
    // console.log("req.query----->", req.query);
    return sendResponse(res, 200, "Authorization successful");
  } catch (error) {
    throw new RequestError(error as string, 500);
  }
}

export async function mediumLoginController(req: Request, res: Response) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;
  // const authURL = getMediumAuthURL({ userId: userId });
  const authURL = "";
  return sendResponse(res, 200, "success", { authURL: authURL });
}

export async function getMediumConfigController(req: Request, res: Response) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;

  const mediumConfig = await findOneMediumConfig({ userId: userId });
  return sendResponse(res, 200, "success", mediumConfig);
}

export async function addMediumAccessTokenController(req: Request, res: Response) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;

  const {accessToken} = req.body;

  if (!accessToken) throw new RequestError("Access Token is required", 400);

  const updateObject: UpdateQuery<ThirdPartyConfig> = {};

  // get medium userInfo
  const mediumUserInfo = await mediumRetrieveMemberDetails({
    accessToken,
  });

  if(!mediumUserInfo) throw new RequestError("Invalid access token", 400);

  updateObject[`medium.userInfo`] = mediumUserInfo;
  updateObject[`medium.token.access_token`] = encryptData(accessToken);
  updateObject[`medium.token.updatedAt`] = Date.now();

  // update medium token in database
  await findOneAndUpdateThirdPartyConfig(
    { userId: userId },
    updateObject,
    {
      upsert: true,
      new: true,
    }
  );
  
  return sendResponse(res, 200, "success", { });
}
