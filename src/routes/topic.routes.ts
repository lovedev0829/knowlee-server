import express from "express";
import { errorWrap } from "../utils/errors.util";
import {
    generateTopicController,
    getAllGeneratedTopic,
} from "../controllers/topic.controller";
import { checkJwt } from "../middleware/auth";
import { checkUser } from "../middleware/checkUser";
import { checkUserUsage } from "../middleware/subscription";

const router = express.Router();
router.use(errorWrap(checkJwt, "Could not verify jwt"));
router.use(errorWrap(checkUser, "Could not verify user"));

router.get(
    "/",
    errorWrap(getAllGeneratedTopic, "Could not get generated topics")
);

router.post(
    "/",
    checkUserUsage("maxTokens"),
    errorWrap(generateTopicController, "Failed to generate topics")
);

export default router;
