import express from "express";
import multer from "multer";

import {
  get,
  getRecent
} from "../controllers/dashboardsummary.controller";
import { errorWrap } from "../utils/errors.util";
import { checkJwt } from "../middleware/auth";

const router = express.Router();
const upload = multer();

// DS routes

router.get("/:userId",
  errorWrap(checkJwt, "Could not verify user"),
  errorWrap(get, "Could not get userKnowledge"));  

router.get("/recent/:userId", 
  errorWrap(checkJwt, "Could not verify user"),
  errorWrap(getRecent, "Could not get queryQuestion"));

export default router;
