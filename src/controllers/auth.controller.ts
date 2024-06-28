import { UserModel } from "../models/user.model";
import { sendResponse } from "../utils/response.utils";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { RequestError } from "../utils/globalErrorHandler";

// We don't use sendRespone here because we can't send a custom structure to auth0



export const getUserForAuth0 = async (req: Request, res: Response) => {
  //console.log('getting user for auth0')
  const { auth0Id } = req.query;
  if (!auth0Id) throw new RequestError('Invalid fields', 400);

  const user = await UserModel.findOne({ auth0Id });

  // Auth0 pattern
  // If the user doesn't exist, return a 200 status and null user.
  if (!user) return res.status(200).json(null);

  return res.status(200).json(user);
};

