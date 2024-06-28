import express from "express";
import { errorWrap } from "../utils/errors.util";
import { checkJwt } from "../middleware/auth";
import { checkUser } from "../middleware/checkUser";
import { getMediumConfigController, mediumAuthCallbackController, mediumLoginController } from "../controllers/medium.controller";


const router = express.Router();

router.get(
  "/callback",
  errorWrap(
    mediumAuthCallbackController,
    "Something went wrong with the medium callback"
  )
);

router.use(errorWrap(checkJwt, "Could not check jwt"));
router.use(errorWrap(checkUser, "Could not check user"));

router.post("/login", errorWrap(mediumLoginController, "could not login to medium"));

router.get("/config", errorWrap(getMediumConfigController, "could not get medium config"));

export default router;
