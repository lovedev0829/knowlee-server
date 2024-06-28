import express from "express";
import { checkJwt } from "../middleware/auth";
import { errorWrap } from "../utils/errors.util";
import {
    generateAudio,
    generateImage,
    generateVideoPreview,
    generateVideoRender,
    imageInterpreterController,
    speechToSpeechController,
    speechToTextController,
    videoToTextController,
    textToSpeechController,
} from "../controllers/queryMedia.controller";
import multer from "multer";
import { checkUser } from "../middleware/checkUser";
import { checkUserUsage } from "../middleware/subscription";

const router = express.Router();
const upload = multer();
router.use(errorWrap(checkJwt, "Could not verify user"));
router.use(errorWrap(checkUser, "Could not verify user"));

router.post(
    "/image",
    // checkUserUsage("maxTextToImageCount"),
    errorWrap(generateImage, "Could not get image")
);

router.post("/audio", errorWrap(generateAudio, "Could not get audio"));

router.post(
    "/videoPreview",
    // checkUserUsage("maxTextToVideoCount"),
    errorWrap(generateVideoPreview, "Could not get video preview")
);

router.post(
    "/videoRender",
    // // already checking in "/videoPreview"
    // checkUserUsage("maxTextToVideoCount"),
    errorWrap(generateVideoRender, "Could not get video preview")
);

router.post(
    "/speech-to-text",
    upload.single("file"),
    // checkUserUsage("speechToTextCount"),
    errorWrap(speechToTextController, "Could not get text from speech")
);

router.post(
    "/image-interpreter",
    // checkUserUsage("maxImageInterpretationCount"),
    checkUserUsage("maxTokens"),
    upload.array("images"),
    errorWrap(imageInterpreterController, "Could not answer your query")
);
router.post(
    "/text-to-speech",
    errorWrap(textToSpeechController, "Could not answer your query")
);

router.post(
    "/speech-to-speech",
    upload.single("file"),
    checkUserUsage("maxTokens"),
    errorWrap(speechToSpeechController, "Could not answer your query")
);

router.post(
    "/video-to-text",
    errorWrap(videoToTextController, "Could not answer your query")
);

export default router;
