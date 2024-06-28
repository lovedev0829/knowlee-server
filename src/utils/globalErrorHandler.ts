// globalErrorHandler.ts
import { Request, Response, NextFunction } from "express";
import { MongoError } from "mongodb";
import { sendResponse } from "./response.utils";

export class RequestError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'RequestError';
  }
}

export class SubscriptionError extends RequestError {
  public statusCode: number;

  constructor(message: string, statusCode = 402) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'SubscriptionError';
  }
}

export class TransactionError extends RequestError {
  constructor(message: string) {
    super(message);
    this.statusCode = 500;
    this.name = "TransactionError";
  }
}

export class AuthenticationError extends RequestError {
  constructor(message: string) {
    super(message);
    this.statusCode = 401;
    this.name = "AuthenticationError";
  }
}

export class ValidationError extends RequestError {
  constructor(message: string) {
    super(message);
    this.statusCode = 422;
    this.name = "ValidationError";
  }
}

export const handleGlobalError = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Need to add a more sophisticated logger like Winston or Bunyan here.
  console.error(err.stack);

  let status = 500;
  let message = err.message;
  let code;

  if (err instanceof TransactionError) {
    return res.status(500).json({
      message: "There was a problem with the database transaction",
      error: err.message
    });
  }

  if (err instanceof MongoError) {
    // Handle MongoDB errors
    status = 400;
    message = "A database error occurred";
    code = err.code; // MongoDB error code
  }

  if (err instanceof RequestError) {
    sendResponse(res, err.statusCode, err.message);
    return;
  }
  // Add more else if blocks here for other types of errors if needed

  res.status(status).send({
    status: 'error',
    message: message,
    code: code, // Specific error code if available
    // In dev send the stack trace
    stack: process.env.DEPLOY_ENV === "development" ? err.stack : undefined
  });
};

