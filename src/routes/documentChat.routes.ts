import express from "express";
import multer from "multer";
import { getDocumentChatHistory, queryWithPdfDocument } from "../controllers/documentChat.controller";
import { checkJwt } from "../middleware/auth";
import { errorWrap } from "../utils/errors.util";
import { withTransaction } from "../utils/transactionHelper";

const router = express.Router();
const upload = multer();

router.get(
  "/:userId",
  errorWrap(checkJwt, "Could not verify user"),
  errorWrap(getDocumentChatHistory, "Could not answer query")
);

router.post(
  "/withDocument",
  errorWrap(checkJwt, "Could not verify user"),
  upload.single("file"),
  withTransaction(
    errorWrap(queryWithPdfDocument, "Could not query with pdf document")
  )
);

export default router;
