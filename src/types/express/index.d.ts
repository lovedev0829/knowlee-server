import express from "express";
import { ClientSession } from "mongoose";
import { User } from "../../models/user.model";

declare global {
  namespace Express {
    interface Request {
      session?: ClientSession;
      user?: User;
      useCredit?: boolean;
    }
  }
}