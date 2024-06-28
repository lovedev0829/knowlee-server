import express from "express";
import { checkJwt } from "../middleware/auth";
import { errorWrap } from "../utils/errors.util";
import { withTransaction } from "../utils/transactionHelper";
import {
  upsertVectorToPinecone,
} from "../controllers/pinecone.controller";
import { checkUser } from "../middleware/checkUser";

const router = express.Router();
router.use(errorWrap(checkJwt, "Could not verify user"));
router.use(errorWrap(checkUser, "Could not verify user"));

router.post(
  "/upsert",
  withTransaction(errorWrap(upsertVectorToPinecone, "Could not upsert vector to pinecone"))
);

export default router;
