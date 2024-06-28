import UserSubscription from "../models/userSubscription.model";

// grace period
const DAY_IN_MS = 86_400_000;

export const checkSubscription = async (userId: string) => {
    const userSubscription = await UserSubscription.findOne({
        userId: userId,
    });

    if (!userSubscription) {
        return false;
    }

    const isValid =
        userSubscription.stripePriceId &&
        userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS >
        Date.now();

    return !!isValid;
};
