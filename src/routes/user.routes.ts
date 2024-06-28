import express from "express";
import multer from "multer";

import {
  create,
  deleteUserAccountController,
  get,
  update
} from "../controllers/user.controller";
import { checkJwt } from "../middleware/auth";
// import { checkAuth0Token } from "../middleware/auth0Token";
import { checkUser } from "../middleware/checkUser";
import { errorWrap } from "../utils/errors.util";
import { withTransaction } from "../utils/transactionHelper";
import { auth0JWTToken } from "../middleware/auth0JWTToken";

const router = express.Router();
const upload = multer();

// Auth0 routes
router.post(
  "/login",
  // errorWrap(checkAuth0Token, "Could not verify auth0 token"),
  errorWrap(auth0JWTToken, "Could not verify auth0 token"),
  withTransaction(
    errorWrap(create, "Could not login user")
  )
);

router.post(
  "/",
  // errorWrap(checkAuth0Token, "Could not verify auth0 token"),
  errorWrap(auth0JWTToken, "Could not verify auth0 token"),
  withTransaction(
    errorWrap(create, "Could not create user")
  )
);

// User routes
router.use(errorWrap(checkJwt, "Could not verify user"));
router.use(errorWrap(checkUser, "Could not verify user"));

router.get("/:userAuth0Id", errorWrap(get, "Could not get user"));

router.put(
  "/",
  upload.single("file"),
  withTransaction(errorWrap(update, "Could not update user"))
);

router.delete("/delete-account", deleteUserAccountController);

export default router;
