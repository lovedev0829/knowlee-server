import { Request, Response } from "express";
import { sendResponse } from "../utils/response.utils";
import { RequestError } from "../utils/globalErrorHandler";
import { findUser } from "../services/user.services";
import {
  findOneAndUpdateThirdPartyConfig,
  findOneThirdPartyConfig,
} from "../services/thirdPartyConfig.services";
import { absoluteUrl } from "../lib/utils";
import {
  trelloGetOAuthAccessToken,
  trelloGetOAuthRequestToken,
} from "../lib/trello/trello.services";
import { encryptData } from "../utils/encryption";

const authorizeURL = "https://trello.com/1/OAuthAuthorizeToken";
const appName = "Knowlee";
const scope = ["read", "write", "account"];
const expiration: "1hour" | "1day" | "30days" | "never" = "never";

export async function trelloAuthCallbackController(
  req: Request,
  res: Response
) {
  try {
    // console.log("req.query----->", req.query);
    const { oauth_token, oauth_verifier } = req.query;
    const thirdPartyConfig = await findOneThirdPartyConfig({
      "trello.token.oauth_token": oauth_token,
    });
    if (!thirdPartyConfig) {
      throw new RequestError(
        `Not Authorized: No third party config found with trello.token.oauth_token = ${oauth_token}`
      );
    }
    const { userId } = thirdPartyConfig;
    const user = await findUser({ id: userId });
    if (!user) throw new Error("User not found");

    trelloGetOAuthAccessToken(
      oauth_token as string,
      thirdPartyConfig?.trello?.token?.oauth_token_secret as string,
      oauth_verifier as string,
      async function (err, token, token_secret, parsedQueryString) {
        // update trello token in database
        await findOneAndUpdateThirdPartyConfig(
          { userId: userId },
          {
            "trello.token.access_token": encryptData(token),
            "trello.token.access_token_secret": encryptData(token_secret),
            "trello.token.updatedAt": Date.now(),
          },
          {
            upsert: true,
            new: true,
          }
        );
        res.redirect(absoluteUrl("/knowledge-sources"));
      }
    );
  } catch (error) {
    throw new RequestError(error as string, 500);
  }
}

export async function trelloLoginController(req: Request, res: Response) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;

  trelloGetOAuthRequestToken(async function (
    err,
    token,
    token_secret,
    parsedQueryString
  ) {
    // update trello token in database
    await findOneAndUpdateThirdPartyConfig(
      { userId: userId },
      {
        "trello.token.oauth_token": encryptData(token),
        "trello.token.oauth_token_secret": encryptData(token_secret),
        "trello.token.updatedAt": Date.now(),
      },
      {
        upsert: true,
        new: true,
      }
    );
    const authURL = `${authorizeURL}?oauth_token=${token}&name=${appName}&scope=${scope}&expiration=${expiration}`;
    return sendResponse(res, 200, "success", { authURL: authURL });
  });
}
