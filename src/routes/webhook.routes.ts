import express from "express";
import { errorWrap } from "../utils/errors.util";
import { webhookPost } from "../controllers/webhook.controller";

const router = express.Router();

router.post(
    "/",
    express.raw({
        type: "*/*"
    }),
    errorWrap(webhookPost, "Webhook Error:")
);

export default router;
