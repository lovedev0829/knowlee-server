import { Request, Response } from "express";
import { RequestError } from "../utils/globalErrorHandler";
import { sendResponse } from "../utils/response.utils";
import UserSubscription from "../models/userSubscription.model";
import {
    stripe,
    stripeCouponseCreate,
    stripeInvoicesList,
    stripeSubscriptionsUpdate,
} from "../lib/stripe";
import { absoluteUrl } from "../lib/utils";
import { findOneUserSubscription } from "../services/stripe/userSubscription.service";
import {
    DYNAMIC_CREDIT_PLAN_IDENTIFIER,
    findOneSubscriptionPlan,
} from "../services/stripe/subscriptionPlan.service";
import { checkUsageStatBeforeDowngrade } from "../middleware/subscription";
import {
    findOneAndUpdateUserSetting,
    getUserSetting,
} from "../services/userSetting.service";

const livemode = process.env.DEPLOY_ENV === "production";

const settingsUrl = absoluteUrl("/dashboard");

export const stripeGet = async (req: Request, res: Response) => {
    if (!req.user) throw new RequestError("Unauthorized", 401);
    const { id: userId, email, _id: user_id } = req.user;
    interface Plans { planDuration: "monthly" | "yearly" , planType: "basic" | "pro", priceId: string }
    const { priceId } : Plans = req.body
    const userSubscription = await UserSubscription.findOne({ userId: userId });
    const subscriptionPlan = await findOneSubscriptionPlan({stripePriceId: priceId})
    const couponCode = subscriptionPlan?.couponCode;

    if (userSubscription && userSubscription.stripeCustomerId) {
        const stripeSession = await stripe.billingPortal.sessions.create({
            customer: userSubscription.stripeCustomerId,
            return_url: settingsUrl
        })
        return sendResponse(res, 200, "success", { url: stripeSession.url });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: settingsUrl,
      cancel_url: settingsUrl,
      payment_method_types: ["card"],
      mode: "subscription",
    //   allow_promotion_codes: true,
      billing_address_collection: "auto",
      customer_email: email,
      line_items: [
          {
              price: priceId,
              quantity: 1,
          }
      ],
      metadata: {
        userId: userId,
          user_id: user_id?.toString(),
      },
      discounts: couponCode ? [{ coupon: couponCode }] : []
    });
      
    return sendResponse(res, 200, "success", { url: stripeSession.url });
};

export const stripeGetInvoicesController = async (
    req: Request,
    res: Response
) => {
    const user = req.user;
    if (!user) throw new RequestError("User not found in request", 401);
    const { stripeCustomerId } = user;
    if (!stripeCustomerId) {
        return sendResponse(res, 200, "success", {
            data: [],
            has_more: false,
            object: "list",
            url: "/v1/invoices",
        });
    }
    const invoices = await stripeInvoicesList({
        customer: stripeCustomerId,
    });
    return sendResponse(res, 200, "success", invoices);
};

export const stripeSubscriptionController = async (
    req: Request,
    res: Response
) => {
    const user = req.user;
    if (!user) throw new RequestError("Could not verify user", 401);
    const { id: userId, email, _id: user_id } = user;
    const { priceId, tolt_referral } = req.body;

    const subscriptionPlan = await findOneSubscriptionPlan({stripePriceId: priceId})
    const couponCode = subscriptionPlan?.couponCode;
    // console.log("couponCode----->", couponCode);
    //console.log("tolt_referral----->", tolt_referral);
    const userSubscription = await UserSubscription.findOne({ userId: userId });
    if (userSubscription && userSubscription.stripeSubscriptionId) {

        const { stripeCustomerId } = userSubscription;
        // retrieve user's payment methods
        const paymentMethods = await stripe.customers.listPaymentMethods(
            stripeCustomerId
        );

        // create checkout session to collect payment method if user does not have any
        if (!paymentMethods?.data[0]?.id) {
            const stripeSession = await stripe.checkout.sessions.create({
                customer: stripeCustomerId,
                success_url: settingsUrl,
                cancel_url: settingsUrl,
                payment_method_types: ["card"],
                mode: "subscription",
                // allow_promotion_codes: true, // make this uncomment when you comment the discounts field for allowing promotions code
                billing_address_collection: "auto",
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                metadata: {
                    userId: userId,
                    user_id: user_id?.toString(),
                    tolt_referral: tolt_referral,
                },
                subscription_data: {
                    metadata: {
                        userId: userId,
                        user_id: user_id?.toString(),
                        tolt_referral: tolt_referral,
                    }
                },
                discounts: couponCode ? [{ coupon: couponCode }] : [],
            });
            return sendResponse(res, 200, "success", { url: stripeSession.url });
        }

        // check current usage stat before downgrade, if exceeded return with error message
        await checkUsageStatBeforeDowngrade(priceId, userId);

        // subscription upgrade downgrade
        const stripeSubscription = await stripe.subscriptions.retrieve(
            userSubscription.stripeSubscriptionId
        );

        let upgradeSub = await stripe.subscriptions.update(
            userSubscription.stripeSubscriptionId,
            {
                cancel_at_period_end: false,
                trial_end: "now",
                proration_behavior: "always_invoice",
                items: [
                    {
                        id: stripeSubscription.items.data[0].id,
                        price: priceId,
                    },
                ],
                metadata: {
                    tolt_referral: tolt_referral,
                },
                discounts: couponCode ? [{ coupon: couponCode }] : [],
            },
        );
        //console.log("upgradeSub----->", upgradeSub);
        return sendResponse(res, 200, "Subscription updated Successfully", upgradeSub);
    }

    const stripeSession = await stripe.checkout.sessions.create({
        success_url: settingsUrl,
        cancel_url: settingsUrl,
        payment_method_types: ["card",],
        mode: "subscription",
        // allow_promotion_codes: true, // make this uncomment when you comment the discounts field for allowing promotions code
        billing_address_collection: "auto",
        customer_email: email,
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        metadata: {
            userId: userId,
            user_id: user_id?.toString(),
            tolt_referral: tolt_referral,
        },
        subscription_data: {
            metadata: {
                userId: userId,
                user_id: user_id?.toString(),
                tolt_referral: tolt_referral,
            }
        },
        discounts: couponCode ? [{ coupon: couponCode }] : [],
    });
    return sendResponse(res, 200, "success", { url: stripeSession.url });
};

export const stripeCreditPaymentController = async (
    req: Request,
    res: Response
) => {
    const user = req.user;
    if (!user) throw new RequestError("Could not verify user", 401);
    const { id: userId, email, _id: user_id } = user;

    const { quantity, tolt_referral } = req.body;
    const purchaseQuantity = Math.max(1, parseInt(quantity, 10) || 1);

    // if (!unit_amount) throw new RequestError("unit_amount is required", 400);

    const currentDate = new Date();
    const userSubscription = await findOneUserSubscription({
        userId: userId,
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate },
    });

    if (!userSubscription) {
        throw new RequestError("User does not have active subscription", 400);
    }

    // get free subscription plan
    const dynamicCreditPlan = await findOneSubscriptionPlan(
        DYNAMIC_CREDIT_PLAN_IDENTIFIER
    );
    if (!dynamicCreditPlan) {
        throw new RequestError("Dynamic Credit Subscription plan not found", 404);
    }

    const stripeSession = await stripe.checkout.sessions.create({
        success_url: settingsUrl,
        cancel_url: settingsUrl,
        payment_method_types: ["card"],
        mode: "payment",
        allow_promotion_codes: true,
        billing_address_collection: "auto",
        customer: userSubscription.stripeCustomerId,
        line_items: [
            {
                price: dynamicCreditPlan.stripePriceId,
                quantity: quantity,
            },
        ],
        metadata: {
            userId: userId,
            user_id: user_id?.toString(),
            type: "DYNAMIC_CREDIT",
            tolt_referral: tolt_referral,
        },
    });

    //console.log("stripeSession----->", stripeSession);

    return sendResponse(res, 200, "success", { url: stripeSession.url });
};

export const stripeApplyDiscountController = async (
    req: Request,
    res: Response
) => {
    const user = req.user;
    if (!user) throw new RequestError("Could not verify user", 401);
    const { id: userId, email, _id: user_id } = user;

    const setting = await getUserSetting(userId);
    if (setting?.specialDiscountUsed)
        throw new RequestError("Already used special discount", 400);

    const userSubscription = await findOneUserSubscription({
        userId: userId,
    });
    if (!userSubscription) {
        throw new RequestError("User does not have active subscription", 400);
    }

    const { stripeSubscriptionId } = userSubscription;

    // create coupon for 90% off
    const coupon = await stripeCouponseCreate({
        duration: "once",
        percent_off: 90,
        max_redemptions: 1,
        metadata: {
            userId: userId,
            stripeCustomerId: userSubscription.stripeCustomerId,
            stripeSubscriptionId: userSubscription.stripeSubscriptionId,
            stripePriceid: userSubscription.stripePriceId,
        },
        name: "Special 90% off",
    });

    // Apply coupon to customer’s existing subscription
    const subscription = await stripeSubscriptionsUpdate(stripeSubscriptionId, {
        coupon: coupon.id,
    });

    // update specialDiscountUsed to true in userSetting
    await findOneAndUpdateUserSetting(
        {
            user: userId,
        },
        {
            specialDiscountUsed: true,
        }
    );

    return sendResponse(res, 200, "success", { coupon, subscription });
};
