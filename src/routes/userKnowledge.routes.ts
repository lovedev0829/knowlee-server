import express from "express";

import {
  get
} from "../controllers/userKnowledge.controller";
import { checkJwt } from "../middleware/auth";
import { errorWrap } from "../utils/errors.util";

const router = express.Router();

router.get("/:userId",
errorWrap(checkJwt, "Could not verify user"),
errorWrap(get, "Could not get userKnowledge"));

export default router;
