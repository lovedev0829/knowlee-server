import express from "express";
import { checkJwt } from "../middleware/auth";
import { errorWrap } from "../utils/errors.util";
import { withTransaction } from "../utils/transactionHelper";
import {
  createConversation,
  deleteConversationById,
  getAllConversations,
  getConversationById,
  updateConversationById,
} from "../controllers/conversation.controller";
import { checkUser } from "../middleware/checkUser";

const router = express.Router();
router.use(errorWrap(checkJwt, "Could not verify user"));
router.use(errorWrap(checkUser, "Could not verify user"));

router.get("/", errorWrap(getAllConversations, "Could not get userKnowledge"));

router.get(
  "/:id",
  errorWrap(getConversationById, "Could not get single entity")
);

router.post(
  "/",
  withTransaction(errorWrap(createConversation, "Could not add entity"))
);

router.patch(
  "/:id",
  withTransaction(errorWrap(updateConversationById, "Could not remove entity"))
);
router.delete(
  "/:id",
  withTransaction(errorWrap(deleteConversationById, "Could not remove entity"))
);

export default router;
