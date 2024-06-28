import express from "express";
import multer from "multer";
import { uploadDocumentFTB, uploadImageForInterpretation, uploadPdfDocument } from "../controllers/upload.controller";
import { checkJwt } from "../middleware/auth";
import { errorWrap } from "../utils/errors.util";
import { withTransaction } from "../utils/transactionHelper";
import { checkUserUsage } from "../middleware/subscription";
import { checkUser } from "../middleware/checkUser";

const router = express.Router();
const upload = multer();

router.use(errorWrap(checkJwt, "Could not verify user"));
router.use(errorWrap(checkUser, "Could not verify user"));

router.post(
  "/pdf",
  upload.single('file'),
  checkUserUsage("maxLocalFileSourceCount"),
  withTransaction(errorWrap(uploadPdfDocument, "Could not extract text from pdf"))
);

router.post(
  "/document",
  upload.single('file'),
  checkUserUsage("maxLocalFileSourceCount"),
  errorWrap(uploadDocumentFTB, "Could not extract text from file")
);

router.post(
  "/image-interpretation",
  // For multiple images
  // upload.array('files'),
  upload.single('files'),
  errorWrap(uploadImageForInterpretation, "Could not upload image")
);

export default router;
