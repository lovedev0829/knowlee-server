import express from "express";
import { errorWrap } from "../utils/errors.util";
import { getTutorialController } from "../controllers/tutorial.controller";
import { checkJwt } from "../middleware/auth";
// import { checkUser } from "../middleware/checkUser";

const router = express.Router();
router.use(errorWrap(checkJwt, "Could not verify jwt"));
// router.use(errorWrap(checkUser, "Could not verify user"));

router.get("/", errorWrap(getTutorialController, "Could not get tutorials"));

export default router;
