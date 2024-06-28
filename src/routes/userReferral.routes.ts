import express from "express";

import { checkJwt } from "../middleware/auth";
import { errorWrap } from "../utils/errors.util";
import { checkUser } from "../middleware/checkUser";
import { getReferralDetails, sendReferralMail } from "../controllers/userRefferal.controller";

const router = express.Router();

router.use(errorWrap(checkJwt, "Could not verify jwt"));
router.use(errorWrap(checkUser, "Could not verify user"));


router.post(
    "/",
    errorWrap(sendReferralMail, "Could not referral mail")
  );

  router.get(
    "/",
    errorWrap(getReferralDetails, "Could not referral mail")
  );
  
  export default router;