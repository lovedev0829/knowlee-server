import { FilterQuery, ProjectionType, QueryOptions, UpdateQuery } from "mongoose";
import UserSubscriptionModel, { UserSubscriptionDocument } from "../../models/userSubscription.model";
import { SubscriptionPlan } from "../../models/stripe/subscriptionPlan.model";

export const findOneUserSubscription = async (
    filter?: FilterQuery<UserSubscriptionDocument>,
    projection?: ProjectionType<UserSubscriptionDocument>,
    options?: QueryOptions<UserSubscriptionDocument>
) => {
    return await UserSubscriptionModel.findOne(filter, projection, options);
};

export async function findUserSubscriptionsWithFeature(userId: string) {
  const FREE_PLAN_IDENTIFIER = {
    stripeProductId: "FREE_PLAN",
    stripePriceId: "FREE_PLAN",
  };
  const userSubscriptionData = await UserSubscriptionModel.aggregate([
    {
      $match: {
        userId: userId,
      },
    },
    {
      $lookup: {
        from: "subscriptionfeatures",
        localField: "plan",
        foreignField: "_id",
        as: "subscriptionFeatures",
      },
    },
    {
      $unwind: "$subscriptionFeatures",
    },
  ]).exec();

  let userSubscription = userSubscriptionData[0];
  // if user doesn't have subscription, returning default (free) plan
  if (!userSubscription) {
    const freeSubscriptionData = await SubscriptionPlan.aggregate([
      {
        $match: FREE_PLAN_IDENTIFIER,
      },
      {
        $lookup: {
          from: "subscriptionfeatures",
          localField: "subscriptionFeature",
          foreignField: "_id",
          as: "subscriptionFeatures",
        },
      },
      {
        $unwind: "$subscriptionFeatures",
      },
    ]).exec();

    const freeSubscription = freeSubscriptionData[0];
    return freeSubscription;
  }

  return userSubscription;
}


export const deleteManyUserSubscriptionDocuments = async (
    filter?: FilterQuery<UserSubscriptionDocument>,
    options?: QueryOptions<UserSubscriptionDocument>
) => {
    return await UserSubscriptionModel.deleteMany(filter, options);
};


export const findOneAndUpdateUserSubscription = async (
    filter?: FilterQuery<UserSubscriptionDocument>,
    update?: UpdateQuery<UserSubscriptionDocument>,
    options?: QueryOptions<UserSubscriptionDocument>
) => {
    return await UserSubscriptionModel.findOneAndUpdate(filter, update, options);
};


export async function findUserSubscription(
    filter: FilterQuery<UserSubscriptionDocument>,
    projection?: ProjectionType<UserSubscriptionDocument>,
    options?: QueryOptions<UserSubscriptionDocument>
) {
    return UserSubscriptionModel.find(filter, projection, options);
}

export async function createOneUserSubscription(doc: Partial<UserSubscriptionDocument>) {
    return await UserSubscriptionModel.create(doc);
}
