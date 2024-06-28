import express from "express";
import { errorWrap } from "../utils/errors.util";
import { telegramWebhookController } from "../controllers/telegram.controller";

const router = express.Router();

router.post(
  "/webhook/botId/:botId/userId/:userId",
  errorWrap(
    telegramWebhookController,
    "Something went wrong with the telegram webhook"
  )
);

export default router;
