import express from "express";
import { errorWrap } from "../utils/errors.util";
import { checkJwt } from "../middleware/auth";
import { checkUser } from "../middleware/checkUser";
import {
  getCarbonAccessTokenController,
  handleSuccessEventController,
} from "../controllers/carbonAI.controller";

const router = express.Router();

router.use(errorWrap(checkJwt, "Could not check JWT token"));
router.use(errorWrap(checkUser, "Could not check user"));

router.get(
  "/auth/access_token",
  errorWrap(getCarbonAccessTokenController, "could not get carbon access token")
);

router.post(
  "/handle-success-event",
  errorWrap(handleSuccessEventController, "could not handle carbon success event")
);

export default router;
