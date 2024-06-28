import express from "express";
import { errorWrap } from "../utils/errors.util";
import { checkJwt } from "../middleware/auth";
import { checkUser } from "../middleware/checkUser";
import {
  twitterAuthCallbackController,
  twitterLoginController,
  getTwitterConfigController,
} from "../controllers/twitter.controller";

const router = express.Router();

router.get(
  "/callback",
  errorWrap(
    twitterAuthCallbackController,
    "Something went wrong with the callback"
  )
);

router.use(errorWrap(checkJwt, "Could not check jwt"));
router.use(errorWrap(checkUser, "Could not check user"));

router.post("/login", errorWrap(twitterLoginController, "could not login"));

router.get("/config", errorWrap(getTwitterConfigController, "could not get twitter config"));

export default router;
