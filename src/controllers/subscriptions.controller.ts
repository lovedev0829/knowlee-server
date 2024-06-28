import { Request, Response } from "express";
import { RequestError } from "../utils/globalErrorHandler";
import { sendResponse } from "../utils/response.utils";
import {
    FREE_PLAN_IDENTIFIER,
    findOneSubscriptionPlan,
    findSubscriptionPlansWithFeatures,
} from "../services/stripe/subscriptionPlan.service";
import {
    findOneAndUpdateUserSubscription,
    findOneUserSubscription,
} from "../services/stripe/userSubscription.service";
import {
    createStripeCustomerFromUser,
    stripeSubscriptionsCreate,
    stripeSubscriptionsRetrieve,
} from "../lib/stripe";
import { SubscriptionFeature } from "../models/subscriptionFeature.model";
import { findOneStatsPriceDocument } from "../services/stripe/statsPrice.services";

export const get = async (req: Request, res: Response) => {
    if (!req.user) throw new RequestError("Unauthorized", 401);

    const subscriptionPlans = await findSubscriptionPlansWithFeatures()
      
    return sendResponse(res, 200, "success", subscriptionPlans);
};

export const getUserSubscriptionController = async (
    req: Request,
    res: Response
) => {
    const user = req.user;
    if (!user) throw new RequestError("Could not verify user", 401);
    const { id: userId, username, email, _id: user_id } = user;

    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
        const stripeCustomer = await createStripeCustomerFromUser(user);
        stripeCustomerId = stripeCustomer.id;
    }

    const currentDate = new Date();
    const activeUserSubscription = await findOneUserSubscription(
        {
            userId: userId,
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate },
        },
        {},
        { populate: { path: "plan", model: SubscriptionFeature } }
    );
    if (!activeUserSubscription) {

        // subscribe to free plan
        // get free subscription plan
        const freeSubscriptionPlan = await findOneSubscriptionPlan(FREE_PLAN_IDENTIFIER);
        if (!freeSubscriptionPlan) {
            throw new RequestError("Free Subscription plan not found", 404);
        }

        // create free subscription
        const subscription = await stripeSubscriptionsCreate({
            customer: stripeCustomerId,
            items: [
                {
                    price: freeSubscriptionPlan.stripePriceId,
                },
            ],
        });

        const subscriptionData = {
            userId: userId,
            stripeSubscriptionId: subscription.id,
            plan: freeSubscriptionPlan.subscriptionFeature,
            stripeCustomerId: subscription.customer as string,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(
                subscription.current_period_end * 1000
            ),
            endDate: new Date(subscription.current_period_end * 1000),
            startDate: new Date(subscription.current_period_start * 1000),
        }

        // create or update userSubscription
        const newUserSubscription = await findOneAndUpdateUserSubscription(
            {
                stripeCustomerId: stripeCustomerId,
                userId: user.id,
            },
            subscriptionData,
            { upsert: true, new: true }
        );

        // // create entry in subscriptionhistory 
        // await createSubscriptionHistory(subscriptionData)

        await newUserSubscription?.populate({ path: "plan", model: SubscriptionFeature })

        return sendResponse(res, 200, "success", {
            userSubscription: newUserSubscription,
            stripeSubscription: subscription,
        });
    }

    const stripeSubscription = await stripeSubscriptionsRetrieve(
        activeUserSubscription.stripeSubscriptionId
    );

    return sendResponse(res, 200, "success", {
        userSubscription: activeUserSubscription,
        stripeSubscription,
    });
};

export const getFreeSubscriptionPlanController = async (
    req: Request,
    res: Response
) => {
    // get free subscription plan
    const freeSubscriptionPlan = await findOneSubscriptionPlan(
        FREE_PLAN_IDENTIFIER
    );
    if (!freeSubscriptionPlan) {
        throw new RequestError("Free Subscription plan not found", 404);
    }

    return sendResponse(res, 200, "success", freeSubscriptionPlan);
};

export const getStatsPriceController = async (
    req: Request,
    res: Response
) => {
    const statsPrice = await findOneStatsPriceDocument();
    return sendResponse(res, 200, "success", statsPrice);
};
