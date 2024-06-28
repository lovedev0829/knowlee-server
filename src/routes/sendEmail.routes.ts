import express from "express";
import { checkJwt } from "../middleware/auth";
import { errorWrap } from "../utils/errors.util";
import { checkUser } from "../middleware/checkUser";
import { sendSupportEmail } from "../controllers/sendEmail.controller";

const router = express.Router();
router.use(errorWrap(checkJwt, "Could not verify user"));
router.use(errorWrap(checkUser, "Could not verify user"));

router.post(
  "/support-email",
  errorWrap(sendSupportEmail, "Could not send support email")
);

export default router;
