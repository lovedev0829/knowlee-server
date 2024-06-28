import express from "express";
import { errorWrap } from "../utils/errors.util";
import { checkJwt } from "../middleware/auth";
import { checkUser } from "../middleware/checkUser";
import {
    stripeApplyDiscountController,
    stripeCreditPaymentController,
    stripeGet,
    stripeGetInvoicesController,
    stripeSubscriptionController,
} from "../controllers/stripe.controller";

const router = express.Router();

router.use(errorWrap(checkJwt, "Could not verify user"));
router.use(errorWrap(checkUser, "Could not verify user"));

router.get(
    "/invoices",
    errorWrap(stripeGetInvoicesController, "Error Fetching invoices")
);

router.get(
    "/",
    errorWrap(stripeGet, "Stripe error")
);

router.post(
    "/payment",
    errorWrap(stripeSubscriptionController, "Stripe error")
);

router.post(
    "/credit-payment",
    errorWrap(stripeCreditPaymentController, "Stripe Credit Payment")
);

router.post(
    "/apply-90-percent-discount",
    errorWrap(stripeApplyDiscountController, "Error applying discount")
);

export default router;
