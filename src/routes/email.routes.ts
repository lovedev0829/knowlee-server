import express from "express";

import { errorWrap } from "../utils/errors.util";
import { create } from "../controllers/email.controller";

const router = express.Router();

router.post("/", errorWrap(create, "Could not create email"));

export default router;
