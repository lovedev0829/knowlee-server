import express from "express";
import {
    generateContentController,
    getAllCreatedContent,
    improveCreatedContentController,
    scheduleContentController,
} from "../controllers/content.controller";
import { errorWrap } from "../utils/errors.util";
import { checkJwt } from "../middleware/auth";
import { checkUser } from "../middleware/checkUser";
import { checkUserUsage } from "../middleware/subscription";

const router = express.Router();
router.use(errorWrap(checkJwt, "Could not verify jwt"));
router.use(errorWrap(checkUser, "Could not verify user"));

router.get(
    "/",
    errorWrap(getAllCreatedContent, "Could not get created content")
);

router.post(
    "/",
    checkUserUsage("maxTokens"),
    errorWrap(generateContentController, "Failed to generate contents")
);

router.post(
    "/improve-content",
    checkUserUsage("maxTokens"),
    errorWrap(improveCreatedContentController, "Failed to improve your contents")
);

router.post(
    "/:id/schedule-content",
    errorWrap(scheduleContentController, "Failed to schedule your contents")
);

export default router;
