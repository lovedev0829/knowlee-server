import express from "express";
import { checkJwt } from "../middleware/auth";
import { errorWrap } from "../utils/errors.util";
import { checkUser } from "../middleware/checkUser";
import { getCryptoInsightsController } from "../controllers/insightCreation.controller";

const router = express.Router();
router.use(errorWrap(checkJwt, "Could not verify user"));
router.use(errorWrap(checkUser, "Could not verify user"));

router.get(
  "/artemis-insight",
  errorWrap(getCryptoInsightsController, "Could not find insights")
);

export default router;
