import express from "express";
import { checkJwt } from "../middleware/auth";
import { checkUser } from "../middleware/checkUser";
import { errorWrap } from "../utils/errors.util";
import { withTransaction } from "../utils/transactionHelper";
import { create, create_new_segmentation } from "../controllers/userSegmentation.controller";

const router = express.Router();

router.use(errorWrap(checkJwt, "Could not verify user"));
router.use(errorWrap(checkUser, "Could not verify user"));

router.post(
  "/",
  withTransaction(errorWrap(create, "Could not create userSegmentation"))
);

router.post(
  "/new-onboarding-segmentation",
  withTransaction(errorWrap(create_new_segmentation, "Could not create userSegmentation and update username"))
);

export default router;
