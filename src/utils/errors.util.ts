import { NextFunction, Request, Response } from "express";
import { RequestError } from "./globalErrorHandler";


// This is used as a safety net for synchrounous errors and refernce the route that threw the error

export function errorWrap(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any> | void,
  contextMessage: string
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await fn(req, res, next);
    } catch (err) {
      console.log("ERROR === >>> ", err);
      const error = err as Error;
      if (!(error instanceof RequestError)) {
        // If it's an unexpected error, create a new RequestError with the additional context message
        err = new RequestError(`${contextMessage}: ${error.message}`);
      }
      next(err);  // Pass the error (either the original or the new one) to the global error handler
    }
  };
}

