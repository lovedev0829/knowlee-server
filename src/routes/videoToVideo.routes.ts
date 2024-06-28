import express from "express";
import { errorWrap } from "../utils/errors.util";
import { checkJwt } from "../middleware/auth";
import { checkUser } from "../middleware/checkUser";
import {
  generateClipController,
  getAllKlapVideosController,
  getKlapExportedClipController,
} from "../controllers/videoToVideo.controller";

const router = express.Router();

router.use(errorWrap(checkJwt, "Could not verify jwt"));
router.use(errorWrap(checkUser, "Could not verify user"));

router.post(
  "/generate-clip",
  errorWrap(generateClipController, "Could not generate-clip")
);

router.get(
  "/klap-video",
  errorWrap(getAllKlapVideosController, "Could not get klap videos")
);

router.get(
  "/klap-exported-clip",
  errorWrap(
    getKlapExportedClipController,
    "Could not get klap exported video clips"
  )
);

export default router;
