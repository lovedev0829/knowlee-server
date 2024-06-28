import express from "express";
import multer from "multer";
import { checkJwt } from "../middleware/auth";
import { errorWrap } from "../utils/errors.util";
import { checkUser } from "../middleware/checkUser";
import {
  createInstantVoiceCloneViaFileUploadController,
  playHTGetClonedVoicesController,
  playHTGetVoicesController
} from "../controllers/playHT.controller";

const router = express.Router();
const upload = multer();

router.get(
  "/cloned-voices",
  errorWrap(playHTGetClonedVoicesController, "Could not get playHT cloned voices")
);

router.use(errorWrap(checkJwt, "Could not verify jwt"));
router.use(errorWrap(checkUser, "Could not verify user"));

router.get(
  "/getVoices",
  errorWrap(playHTGetVoicesController, "Could not get playHT voices")
);

router.post(
  "/cloned-voices/instant",
  upload.single("sample_file"),
  errorWrap(createInstantVoiceCloneViaFileUploadController, "Could not clone voice")
);


export default router;
