import { NextFunction, Request, Response } from "express";
import { AuthenticationError } from "../utils/globalErrorHandler";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.model";

export const checkUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return next(new AuthenticationError("Missing Authorization Header"));
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return next(new AuthenticationError("Missing Bearer Token"));
    }
    const decodedTokenPayload = jwt.decode(token);
    ////console.log("Audio transciption successful", token);
    ////console.log("Audio transciption successful", decodedTokenPayload);
    const auth0Id = decodedTokenPayload?.sub;
    ////console.log("Audio transciption successful", auth0Id);
    const user = await UserModel.findOne({ auth0Id });
    if (!user) {
      return next(new AuthenticationError("User not found!"));
    }
    req.user = user;

    next();
  } catch (error) {
    return next(new AuthenticationError("User not found"));
  }
};
