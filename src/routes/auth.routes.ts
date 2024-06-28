import express from "express";

import { getUserForAuth0 } from "../controllers/auth.controller";
// import { checkAuth0Token } from "../middleware/auth0Token";
import { errorWrap } from "../utils/errors.util";
import { auth0JWTToken } from "../middleware/auth0JWTToken";

const router = express.Router();


// Auth0 routes

router.get("/user", 
// errorWrap(checkAuth0Token, "Could not verify auth0 token"),
errorWrap(auth0JWTToken, "Could not verify auth0 token"),
errorWrap(getUserForAuth0, "Could not login user"));


export default router;
