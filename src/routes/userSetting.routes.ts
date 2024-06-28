import express from "express";
import { get, update } from '../controllers/userSetting.controller';
import { errorWrap } from '../utils/errors.util';
import { checkJwt } from '../middleware/auth';

const router = express.Router();

router.get("/:userId",
  errorWrap(checkJwt, "Could not verify user"),
  errorWrap(get, "Could not get user setting"));

router.post("/:userId",
  errorWrap(checkJwt, "Could not verify user"),
  errorWrap(update, "Could not update user setting"));

export default router;


