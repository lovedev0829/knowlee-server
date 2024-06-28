import express from "express";
import { errorWrap } from "../utils/errors.util";
import { checkJwt } from "../middleware/auth";
import { checkUser } from "../middleware/checkUser";
import {
    get,
    getFreeSubscriptionPlanController,
    getStatsPriceController,
    getUserSubscriptionController,
} from "../controllers/subscriptions.controller";

const router = express.Router();

router.use(errorWrap(checkJwt, "Could not verify user"));
router.use(errorWrap(checkUser, "Could not verify user"));

router.get(
    "/user-subscription",
    errorWrap(getUserSubscriptionController, "Could not get subscription")
);

router.get(
    "/free-subscription-plan",
    errorWrap(
        getFreeSubscriptionPlanController,
        "Could not get free subscription plan"
    )
);

router.get(
    "/stats-price",
    errorWrap(
        getStatsPriceController,
        "Could not get stats price"
    )
);

router.get(
    "/",
    errorWrap(get, "Subscription error")
);

export default router;
