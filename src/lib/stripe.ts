import Stripe from "stripe";
import {
    CustomerCreateParams,
    CustomerRetrieveParams,
    SubscriptionCreateParams,
    SubscriptionRetrieveParams,
} from "../types/stripe.types";
import {
    FREE_PLAN_IDENTIFIER,
    findOneSubscriptionPlan,
} from "../services/stripe/subscriptionPlan.service";
import { RequestError } from "../utils/globalErrorHandler";
import { User } from "../models/user.model";
import { findUserSubscription } from "../services/stripe/userSubscription.service";
import { findUser } from "../services/user.services";

export const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
    apiVersion: "2023-10-16",
    typescript: true,
});

export async function stripeProductsList(
    params?: Stripe.ProductListParams,
    options?: Stripe.RequestOptions
) {
    const response = await stripe.products.list(params, options);
    return response.data;
}

export async function stripePricesList(
    params?: Stripe.PriceListParams,
    options?: Stripe.RequestOptions
) {
    const response = await stripe.prices.list(params, options);
    return response.data;
}

export async function stripeCustomersCreate(params: CustomerCreateParams) {
    const customer = await stripe.customers.create(params);
    return customer;
}

export async function createStripeCustomerFromUser(user: User) {
    const customer = await stripeCustomersCreate({
        name: user.username,
        email: user.email,
        metadata: {
            userId: user.id,
            user_id: user._id?.toString(),
        },
    });
    
    user.stripeCustomerId = customer.id;
    await user.save();
    return customer;
}
   
   export async function stripeSearchCustomerByEmail(email: string) {
       let query = `email:"${email}"`; 
       const customer = await stripe.customers.search({ query });
       return customer?.data[0];
   }

export async function stripeCustomersRetrieve(
    id: string,
    params?: CustomerRetrieveParams
) {
    return await stripe.customers.retrieve(id, params);
}

export async function stripeSubscriptionsCreate(
    params: SubscriptionCreateParams
) {
    const subscription = await stripe.subscriptions.create(params);
    return subscription;
}

export async function stripeSubscriptionsRetrieve(
    id: string,
    params?: SubscriptionRetrieveParams
) {
    const subscription = await stripe.subscriptions.retrieve(id, params);
    return subscription;
}

export async function stripeSubscriptionsUpdate(
    id: string,
    params?: Stripe.SubscriptionUpdateParams
) {
    const subscription = await stripe.subscriptions.update(id, params);
    return subscription;
}

// export async function subscribeToFreePlan(user: User) {
//     const { id: userId, username, email, _id: user_id } = user;

//     // get free subscription plan
//     const freeSubscriptionPlan = await findOneSubscriptionPlan(FREE_PLAN_IDENTIFIER);
//     if (!freeSubscriptionPlan) {
//         throw new RequestError("Free Subscription plan not found", 404);
//     }

//     // create stripe customer
//     const customer = await stripeCustomersCreate({
//         name: username,
//         email: email,
//         metadata: {
//             userId,
//             user_id,
//         },
//     });

//     // create free subscription
//     const subscription = await stripeSubscriptionsCreate({
//         customer: customer.id,
//         items: [
//             {
//                 price: freeSubscriptionPlan.stripePriceId,
//             },
//         ],
//     });
//     return { subscription, customer, freeSubscriptionPlan };
// }

export async function removeAbsentStripeSubscription() {
    // find all user subscriptions
    const userSubscriptions = await findUserSubscription({});
    // const userSubscriptions = await findUserSubscription({stripeSubscriptionId:"sub_1OU3nVDzJg7xgkCmOXeQCZk8"});

    for(const userSubscription of userSubscriptions){
        const { stripeSubscriptionId } = userSubscription;
        try {
        const stripeSubscription = await stripeSubscriptionsRetrieve(stripeSubscriptionId);
        // console.log("stripeSubscription----->", stripeSubscription);
        } catch (error) {
            if((error as {statusCode?: number})?.statusCode === 404){
                // console.log(`${stripeSubscriptionId} subscription not found on stripe`);
                await userSubscription.deleteOne();
            } else {
                // console.log("removeAbsentStripeSubscription error----->", error);
            }
        }
    }
    // console.log("DONE:removeAbsentStripeSubscription");
}

export async function removeAbsentStripeCustomerId() {
    // find all users
    const users = await findUser({
        stripeCustomerId: { $exists: true, $ne: null },
    });

    for (const user of users) {
        const { stripeCustomerId } = user;
        try {
            const stripeCustomer = await stripeCustomersRetrieve(stripeCustomerId);
            // console.log("stripeCustomer----->", stripeCustomer);
        } catch (error) {
            if ((error as { statusCode?: number })?.statusCode === 404) {
                // console.log(`${stripeCustomerId} customer not found on stripe`);
                user.set("stripeCustomerId", null);
                await user.save();
            } else {
                // console.log("removeAbsentStripeCustomerId error----->", error);
            }
        }
    }
    // console.log("DONE:removeAbsentStripeCustomerId");
}

export async function stripeCouponseCreate(
    params?: Stripe.CouponCreateParams
) {
    return await stripe.coupons.create(params);
}

export async function stripeInvoicesList(params?: Stripe.InvoiceListParams) {
    const invoices = await stripe.invoices.list({
        limit: 100,
        ...(params || {}),
    });
    return invoices;
}

export async function stripeCustomersDel(id: string) {
    const deleted = await stripe.customers.del(id);
    return deleted;
}
