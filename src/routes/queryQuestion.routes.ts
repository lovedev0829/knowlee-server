import express from "express";
import { checkJwt } from "../middleware/auth";
import { errorWrap } from "../utils/errors.util";
import { withTransaction } from "../utils/transactionHelper";
import {
  createQuestion,
  deleteQuestionById,
  getAllQuestions,
  getQuestionByConversationId,
  getQuestionById,
  updateQuestionById,
} from "../controllers/queryQuestion.controller";

const router = express.Router();
router.use(errorWrap(checkJwt, "Could not verify user"));

router.get("/", errorWrap(getAllQuestions, "Could not get queryQuestion"));

router.get("/:id", errorWrap(getQuestionById, "Could not get single entity"));
router.get("/conversation/:conversationId", errorWrap(getQuestionByConversationId, "Could not get Questions from conversationId"));

router.post(
  "/",
  withTransaction(errorWrap(createQuestion, "Could not add entity"))
);

router.patch(
  "/:id",
  withTransaction(errorWrap(updateQuestionById, "Could not update entity"))
);
router.delete(
  "/:id",
  withTransaction(errorWrap(deleteQuestionById, "Could not remove entity"))
);

export default router;
