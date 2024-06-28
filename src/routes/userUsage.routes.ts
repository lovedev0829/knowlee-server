import express from "express";
import multer from "multer";

import { get, getRecent } from "../controllers/dashboardsummary.controller";
import { errorWrap } from "../utils/errors.util";
import { checkJwt } from "../middleware/auth";
import { getUserUsageController } from "../controllers/userUsage.controller";
import { checkUser } from "../middleware/checkUser";

const router = express.Router();

// DS routes
router.use(errorWrap(checkJwt, "Could not verify jwt"));
router.use(errorWrap(checkUser, "Could not verify user"));

router.get(
  "/",
  errorWrap(checkJwt, "Could not verify user"),
  errorWrap(getUserUsageController, "Could not get userKnowledge")
);

export default router;
