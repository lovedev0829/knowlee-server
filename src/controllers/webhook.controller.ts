import { Request, Response } from "express";
import { sendResponse } from "../utils/response.utils";
import { absoluteUrl } from "../lib/utils";
import Stripe from "stripe";
import { stripe, stripeCustomersRetrieve } from "../lib/stripe";
import { RequestError } from "../utils/globalErrorHandler";
import UserSubscription from "../models/userSubscription.model";
import { SubscriptionPlan } from "../models/stripe/subscriptionPlan.model";
import { createSubscriptionHistory } from "../services/stripe/subscriptionHistory.service";
// import { getUserByEmail } from "../services/user.services";
import {
    findOneAndUpdateUserSubscription,
    findOneUserSubscription,
} from "../services/stripe/userSubscription.service";
import { createOneUserCreditPaymentDocument } from "../services/stripe/userCreditPayment.services";
import { findOneAndUpdateUserUsageStatDocument } from "../services/userUsageStat.services";

const settingsUrl = absoluteUrl("/settings");

export const webhookPost = async (req: Request, res: Response) => {
    const payload = req.body;
    const stripeSignature = req.headers["stripe-signature"] as string;
    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(
            payload,
            stripeSignature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        throw new RequestError(`Webhook Error: ${error.message}`, 400);
    }

    let session;
    let subscription;
    switch (event.type) {
        case "checkout.session.completed": {
            // Handle successful payment
            session = event.data.object;
            //console.log("checkout.session.completed", session);
            const {
                amount_total,
                amount_subtotal,
                status,
                customer: stripeCustomerId,
                id: stripeCheckoutSessionId,
                metadata,
            } = session;

            if (status === "expired") break;
            if (status === "open") break;

            if (metadata?.type === "DYNAMIC_CREDIT") {
                let totalCreditsBuy = 0;

                // Retrieve the line items for the session
                const lineItems = await stripe.checkout.sessions.listLineItems(
                    stripeCheckoutSessionId,
                    {
                        limit: 100,
                    }
                );

                // Process the line items
                lineItems?.data?.forEach(({ quantity }) => {
                    totalCreditsBuy += quantity || 0;
                });
            
                // create entry in userCreditPayment collection
                const userCreditPayment = await createOneUserCreditPaymentDocument({
                    amount_subtotal: amount_subtotal as number,
                    amount_total: amount_total as number,
                    quantity: totalCreditsBuy,
                    stripeCheckoutSessionId: stripeCheckoutSessionId,
                    stripeCustomerId: stripeCustomerId as string,
                    userId: metadata?.userId,
                });

                // add credit amount in userUsageStat
                const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
                    { userId: metadata?.userId },
                    { $inc: { "credit.total": totalCreditsBuy } },
                    { upsert: true, new: true }
                );
                return sendResponse(res, 200, "success", userCreditPayment);
            }
            break;
        }

        case "invoice.payment_succeeded":
            session = event.data.object;
            subscription = await stripe.subscriptions.retrieve(
                session.subscription as string
            );
            const stripeCustomerId = session.customer as string;
            if (!stripeCustomerId) {
                throw new RequestError("Could not find stripe customer", 400);
            }

            const customer = await stripeCustomersRetrieve(stripeCustomerId);
            if (customer.deleted) {
                throw new RequestError(
                    `Stripe customer deleted ${stripeCustomerId}`,
                    400
                );
            }

            const { userId } = customer.metadata;
            
            // if(!session.customer_email) throw new RequestError("Could not find the user email from session", 400);
            
            const subscriptionPlan = await SubscriptionPlan.findOne({ stripePriceId: subscription.items.data[0].price.id })
            if(!subscriptionPlan){
                throw new RequestError("Could not find the subscription plan", 400);
            }

            // const user = await getUserByEmail(session.customer_email)
            // if(!user) throw new RequestError("Could not find the user", 400);
            
            const subscriptionData = {
                userId: userId,
                stripeSubscriptionId: subscription.id,
                plan: subscriptionPlan.subscriptionFeature,
                stripeCustomerId: subscription.customer as string,
                stripePriceId: subscription.items.data[0].price.id,
                stripeCurrentPeriodEnd: new Date(
                    subscription.current_period_end * 1000
                ),
                endDate: new Date(subscription.current_period_end * 1000),
                startDate: new Date(subscription.current_period_start * 1000),
            }

            // save payment method cards
            const invoiceDetail = event.data.object;
            if (invoiceDetail.default_payment_method === null) {
                const paymentMethods = await stripe.customers.listPaymentMethods(
                    event.data.object.customer as string
                );
                if (paymentMethods?.data[0]?.id) {
                    const subscription = await stripe.subscriptions.update(
                        invoiceDetail.subscription as string,
                        {
                            default_payment_method: paymentMethods.data[0].id,
                        }
                    );

                    const customer = await stripe.customers.update(
                        event.data.object.customer as string,
                        {
                            invoice_settings: {
                                default_payment_method: paymentMethods.data[0].id,
                            },
                        }
                    );
                }
            }

            await findOneAndUpdateUserSubscription(
                {
                    stripeCustomerId: subscription.customer,
                    userId: userId,
                },
                subscriptionData,
                { upsert: true, new: true }
            );
            await createSubscriptionHistory(subscriptionData)
            
            break;

        case "payment_intent.succeeded":
            // Handle successful payment
            session = event.data.object;
            //console.log("Payment successful", session);
            break;

        case "payment_intent.payment_failed":
            // Handle payment failure
            session = event.data.object;
            //console.log("Payment failed", session);
            break;

        case "customer.subscription.updated": {
            // Handle subscription renewal or update;
            subscription = event.data.object;
            const stripeCustomerId = subscription.customer as string;
            //console.log("subscription----->", subscription);

            const userSubscription = await findOneUserSubscription({ stripeCustomerId: stripeCustomerId });
            if (!userSubscription) {
                // throw new RequestError("userSubscription", 404);
                return sendResponse(res, 200, "success");
            }

            // const stripePrice = subscription.items.data[0].price;
            // const interval = stripePrice.recurring?.interval;

            // let newPlanEndDate = new Date(subscription.current_period_end * 1000);

            // if (interval === "month") {
            //     newPlanEndDate.setMonth(newPlanEndDate.getMonth() + 1);
            // } else if (interval === "year") {
            //     newPlanEndDate.setFullYear(newPlanEndDate.getFullYear() + 1);
            // }

            // const subscriptionPlan = await SubscriptionPlan.findOne({ stripePriceId: stripePrice.id })
            // if (!subscriptionPlan) {
            //     throw new RequestError("Could not find the subscription plan", 400);
            // }


            // const subscriptionData = {
            //     userId: userSubscription.userId,
            //     stripeSubscriptionId: subscription.id,
            //     plan: subscriptionPlan.subscriptionFeature,
            //     stripeCustomerId: stripeCustomerId,
            //     stripePriceId: stripePrice.id,
            //     stripeCurrentPeriodEnd: new Date(
            //         subscription.current_period_end * 1000
            //     ),
            //     endDate: newPlanEndDate,
            //     // startDate of updated plan will be the end date of current plan
            //     startDate: new Date(subscription.current_period_end * 1000),
            // };

            // await UserSubscription.create(subscriptionData);
            // await createSubscriptionHistory(subscriptionData);

            //console.log("Subscription renewed or updated", event.data.object);
            break;
        }

        case "customer.subscription.deleted":
            session = event.data.object;
            // Handle subscription cancellation
            //console.log("Subscription cancelled", session);
            break;

        default:
            //console.log(`Unhandled event type: ${event.type}`);
    }

    return sendResponse(res, 200, "success", null);
};
