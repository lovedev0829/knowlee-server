import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { TransactionError } from "./globalErrorHandler";

export const withTransaction = (
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      req.session = session;
      await handler(req, res, next);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof Error) {
        next(new TransactionError(error.message));
      } else {
        next(new TransactionError('An unknown transaction error occurred'));
      }
    } finally {
      await session.endSession();
    }
  };
}