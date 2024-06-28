import { ISubscriptionFeature } from "../models/subscriptionFeature.model";
import { findOneUserSubscription } from "../services/stripe/userSubscription.service";
import { findOneAndUpdateUserUsageStatDocument } from "../services/userUsageStat.services";
import { RequestError } from "./globalErrorHandler";

export async function checkUserTokenUsage(userId: string) {
    const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
        { userId: userId },
        {},
        { new: true, upsert: true }
    );

    const currentDate = new Date();
    const activeUserSubscription = await findOneUserSubscription(
        {
            userId: userId,
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate },
        },
        {},
        { populate: { path: "plan", model: "SubscriptionFeature" } }
    );
    const tokenUsed = userUsageStat?.tokenUsed || 0;
    const maxTokens = (activeUserSubscription?.plan as ISubscriptionFeature)
        ?.features?.maxTokens;

    if (tokenUsed && maxTokens) {
        if (tokenUsed >= maxTokens) {
            throw new RequestError("Token usage exceeded", 403);
        }
    }
}
