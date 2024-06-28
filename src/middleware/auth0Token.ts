import { NextFunction, Request, Response } from "express";
import { AuthenticationError } from "../utils/globalErrorHandler";

export const checkAuth0Token = (req: Request, res: Response, next: NextFunction) => {
  ////console.log('checking token')

  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return next(new AuthenticationError('Missing Authorization Header'));
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return next(new AuthenticationError('Missing Bearer Token'));
  }

  if (token !== process.env.AUTH0_SECRET) {
    return next(new AuthenticationError('Invalid Token'));
  }
  
  ////console.log('token verified')
  next();
};
