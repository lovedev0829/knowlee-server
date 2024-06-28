import {
  FilterQuery,
  PipelineStage,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
} from "mongoose";
import { SubscriptionPlan, ISubscriptionPlan } from "../../models/stripe/subscriptionPlan.model";

const livemode = process.env.DEPLOY_ENV === "production";

export const FREE_PLAN_IDENTIFIER = {
  name: "FREE",
  livemode,
};

export const DYNAMIC_CREDIT_PLAN_IDENTIFIER = {
  name: "DYNAMIC_CREDIT",
  livemode,
};

export const findOneSubscriptionPlan = async (
    filter?: FilterQuery<ISubscriptionPlan>,
    projection?: ProjectionType<ISubscriptionPlan>,
    options?: QueryOptions<ISubscriptionPlan>
) => {
    return await SubscriptionPlan.findOne(filter, projection, options);
};

export async function findSubscriptionPlans(
    filter: FilterQuery<ISubscriptionPlan>,
    projection?: ProjectionType<ISubscriptionPlan>,
    options?: QueryOptions<ISubscriptionPlan>
) {
    return await SubscriptionPlan.find(filter, projection, options).populate('subscriptionFeature')
    .exec();
}

export async function findSubscriptionPlansWithFeatures() {
  const pipeline: PipelineStage[] = [
    {
      $match: {
        livemode: livemode,
      }
    },
    {
      $lookup: {
        from: "subscriptionfeatures",
        localField: "_id",
        foreignField: "subscriptionPlan",
        as: "subscriptionFeatures",
      },
    },
    {
      $unwind: {
        path: "$subscriptionFeatures",
      },
    },
    {
      $sort: {
        priority: 1,
      },
    },
    {
      $group: {
        _id: "$subscriptionFeatures.interval",
        subscriptions: {
          $push: {
            _id: "$_id",
            interval: "$interval",
            livemode: "$livemode",
            name: "$name",
            planType: "$planType",
            openai_model: "$openai_model",
            price: "$price",
            priority: "$priority",
            stripeProductId: "$stripeProductId",
            stripePriceId: "$stripePriceId",
            subscriptionFeature: {
              _id: "$subscriptionFeature._id",
              name: "$subscriptionFeatures.name",
              price: "$subscriptionFeatures.price",
              fullprice: "$subscriptionFeatures.fullprice",
              features: "$subscriptionFeatures.features",
              planType: "$subscriptionFeatures.planType",
              additionalPerks: "$subscriptionFeatures.additionalPerks",
              priority: "$subscriptionFeatures.priority",
            },
            createdAt: "$createdAt",
            updatedAt: "$updatedAt",
          },
        },
      },
    },
  ];

  return await SubscriptionPlan.aggregate(pipeline).exec();
}

export const deleteManyISubscriptionPlans = async (
    filter?: FilterQuery<ISubscriptionPlan>,
    options?: QueryOptions<ISubscriptionPlan>
) => {
    return await SubscriptionPlan.deleteMany(filter, options);
};


export const findOneAndUpdateSubscriptionPlan = async (
    filter?: FilterQuery<ISubscriptionPlan>,
    update?: UpdateQuery<ISubscriptionPlan>,
    options?: QueryOptions<ISubscriptionPlan>
) => {
    return await SubscriptionPlan.findOneAndUpdate(filter, update, options);
};


export async function findSubscriptionPlan(
    filter: FilterQuery<ISubscriptionPlan>,
    projection?: ProjectionType<ISubscriptionPlan>,
    options?: QueryOptions<ISubscriptionPlan>
) {
    return SubscriptionPlan.find(filter, projection, options);
}

export async function createOneSubscriptionPlan(doc: Partial<ISubscriptionPlan>) {
    return await SubscriptionPlan.create(doc);
}