import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthenticationError } from "../utils/globalErrorHandler";

const AUTH0_JWT_SECRET = process.env.AUTH0_JWT_SECRET!;

export const auth0JWTToken = (
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
    const jwtPayload = jwt.verify(token, AUTH0_JWT_SECRET);
    // console.log("jwtPayload------>", jwtPayload);
    next();
  } catch (error) {
    return next(new AuthenticationError("Failed to authenticate token"));
  }
};
