import { NextFunction, Request, Response } from "express";
import {
  AuthenticationError,
  RequestError,
  SubscriptionError,
} from "../utils/globalErrorHandler";
import {
  findOneAndUpdateUserUsageStatDocument,
  findOneUserUsageStatDocument,
} from "../services/userUsageStat.services";
import {
  findOneUserSubscription,
  findUserSubscriptionsWithFeature,
} from "../services/stripe/userSubscription.service";
import {
  ISubscriptionFeature,
  SubscriptionPlanFeatures,
} from "../models/subscriptionFeature.model";
import { findOneSubscriptionFeature } from "../services/stripe/subscriptionFeature.service";
import {
  FREE_PLAN_IDENTIFIER,
  findOneSubscriptionPlan,
} from "../services/stripe/subscriptionPlan.service";
import { isDoubleStepApifyProcess } from "../services/apify.services";
import csv from "csvtojson";
import { findOneStatsPriceDocument } from "../services/stripe/statsPrice.services";

const livemode = process.env.DEPLOY_ENV === "production";

type SubscriptionAllowedFeatures = Omit<SubscriptionPlanFeatures, "max_tokens">;

type CheckUserUsageKey =
  | keyof SubscriptionPlanFeatures
  | "ENTITY_BULK_UPLOAD_VIA_CSV"
  | "MULTIPLE_ENTITIES";

export const checkSubscriptionPlan = (
  source?: keyof SubscriptionAllowedFeatures
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return next(new AuthenticationError("User not found"));
    }

    let userUsage = await findOneUserUsageStatDocument(
      { userId: user.id },
      {},
      { lean: true }
    );

    let subscriptionData = await findUserSubscriptionsWithFeature(user.id);
    
    if (!subscriptionData || !subscriptionData?.subscriptionFeatures) {
      return next(new SubscriptionError("Subscription not found"));
    }

    const userUsedTokens = userUsage?.tokenUsed ?? 0;
    const tokenLimit =
      subscriptionData?.subscriptionFeatures?.features?.max_tokens;

    if (userUsedTokens > tokenLimit) {
      return next(new SubscriptionError("Token limit exceeded"));
    }


    const currentDate = new Date().getTime()
    const subscriptionEndDate = new Date(subscriptionData.stripeCurrentPeriodEnd).getTime()

    if(currentDate > subscriptionEndDate) {
      return next(
        new SubscriptionError(
          `Your plan has expired, Please buy subscription to continue using knowlee`
        )
      );
    } 

    if (source) {
      const isAccessAllowed =
        subscriptionData?.subscriptionFeatures?.features?.[source];

      if (!isAccessAllowed) {
        return next(
          new SubscriptionError(
            `'${source}' feature is not supported in your plan`
          )
        );
      }
    }

    next();
  };
};

export function getSingleAndDoubleEntityCount<T>(entityCount: T) {
  let doubleStepCount = 0;
  let singleStepCount = 0;
  for (const sourceType in entityCount) {
    for (const subSetType in entityCount[sourceType]) {
      const currentCount = entityCount[sourceType][subSetType];
      if (typeof currentCount !== "number") {
        // console.log("currentCount----->", sourceType, subSetType, currentCount);
        continue;
      }
      if (isDoubleStepApifyProcess({ sourceType, subSetType })) {
        doubleStepCount += currentCount;
      } else {
        singleStepCount += currentCount;
      }
    }
  }
  return { doubleStepCount, singleStepCount };
}

export function getDynamicSourceCount<T>(entityCount: T) {
  let count = 0;
  for (const sourceType in entityCount) {
    for (const subSetType in entityCount[sourceType]) {
      if (isDoubleStepApifyProcess({ sourceType, subSetType })) {
        count += entityCount[sourceType][subSetType] as number;
      }
    }
  }
  return count;
}

export function getStaticSourceCount<T>(entityCount: T) {
  let count = 0;
  for (const sourceType in entityCount) {
    for (const subSetType in entityCount[sourceType]) {
      if (!isDoubleStepApifyProcess({ sourceType, subSetType })) {
        count += entityCount[sourceType][subSetType] as number;
      }
    }
  }
  return count;
}

export function getTextToImageCount<T>(textToImage: T) {
  let count = 0;
  for (const type in textToImage) {
    count += textToImage[type] as number;
  }
  return count;
}

export function checkUserUsage(key: CheckUserUsageKey) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) throw new RequestError("Could not verify user", 401);
      const { id: userId } = user;

      const currentDate = new Date();

      // find active subscription
      const activeUserSubscription = await findOneUserSubscription({
        userId: userId,
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate },
      });
      let subscriptionfeature: ISubscriptionFeature | null = null;
      if (activeUserSubscription) {
        subscriptionfeature = await findOneSubscriptionFeature({
          _id: activeUserSubscription.plan,
          livemode,
        });
      }
      if (!subscriptionfeature) {
        // find free subscription feature
        const freeSubscriptionPlan = await findOneSubscriptionPlan(
          FREE_PLAN_IDENTIFIER
        );
        subscriptionfeature = await findOneSubscriptionFeature({
          subscriptionPlan: freeSubscriptionPlan,
          livemode,
        });
      }

      if (!subscriptionfeature) {
        throw new SubscriptionError("Subscription not found");
      }

      const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
        {
          userId: userId,
        },
        { userId: userId },
        { new: true, upsert: true }
      );

      if (!userUsageStat) {
        return next(new SubscriptionError(`UserUsageStat not found`));
      }
      const userUsageStatJSON = userUsageStat.toJSON();

      const statsPrice = await findOneStatsPriceDocument({});

      if (!statsPrice) {
        console.error("Please create a document in statsprices collection");
        throw new SubscriptionError("StatsPrice not found");
      }

      const hasCreditsLeft = userUsageStat?.credit?.used < userUsageStat?.credit?.total;
      const creditsLeft = userUsageStat?.credit?.total - userUsageStat?.credit?.used;

      switch (key) {
        case "maxDynamicDataSourceCount": {
          const currentDynamicCount = getDynamicSourceCount(
            userUsageStatJSON.entityCount
          );
          if (
            currentDynamicCount <
            subscriptionfeature.features.maxDynamicDataSourceCount
          ) {
            return next();
          }

          // Allow if the user has credits
          if (hasCreditsLeft) {
            const unitCost =
              statsPrice.features?.dynamicDataSource?.unitCost || 1;
            // update userUsageStat credit used
            userUsageStat.credit.used += unitCost;
            await userUsageStat.save();
            return next();
          }
          break;
        }

        case "maxImageInterpretationCount": {
          if (
            userUsageStatJSON.imageInterpretationCount <
            subscriptionfeature.features.maxImageInterpretationCount
          ) {
            return next();
          }

          // Allow if the user has credits
          if (hasCreditsLeft) {
            const unitCost =
              statsPrice.features?.imageInterpretation?.unitCost || 1;
            // update userUsageStat credit used
            userUsageStat.credit.used += unitCost;
            await userUsageStat.save();
            return next();
          }
          break;
        }

        case "maxLocalFileSourceCount": {
          if (
            userUsageStatJSON?.localEntityCount <
            subscriptionfeature?.features?.maxLocalFileSourceCount
          ) {
            return next();
          }

          // Allow if the user has credits
          // if (hasCreditsLeft) {
          //   const unitCost =
          //     statsPrice.features?.localFileSource?.unitCost || 1;
          //   // update userUsageStat credit used
          //   userUsageStat.credit.used += unitCost;
          //   await userUsageStat.save();
          //   return next();
          // }
          break;
        }

        case "maxStaticDataSourceCount": {
          let currentStaticCount = getStaticSourceCount(
            userUsageStatJSON.entityCount
          );

          if (
            currentStaticCount <
            subscriptionfeature.features.maxStaticDataSourceCount
          ) {
            return next();
          }

          // Allow if the user has credits
          if (hasCreditsLeft) {
            const unitCost =
              statsPrice.features?.staticDataSource?.unitCost || 1;
            // update userUsageStat credit used
            userUsageStat.credit.used += unitCost;
            await userUsageStat.save();
            return next();
          }
          break;
        }

        case "maxTextToImageCount": {
          const currentTextToImageCount = getTextToImageCount(
            userUsageStatJSON.textToImage
          );
          if (
            currentTextToImageCount <
            subscriptionfeature.features.maxTextToImageCount
          ) {
            return next();
          }

          // Allow if the user has credits
          if (hasCreditsLeft) {
            const unitCost = statsPrice.features?.textToImage?.unitCost || 1;
            // update userUsageStat credit used
            userUsageStat.credit.used += unitCost;
            await userUsageStat.save();
            return next();
          }
          break;
        }

        case "maxTextToVideoCount": {
          if (
            userUsageStatJSON.textToVideoCount <
            subscriptionfeature.features.maxTextToVideoCount
          ) {
            return next();
          }

          // Allow if the user has credits
          if (hasCreditsLeft) {
            const unitCost = statsPrice.features?.textToVideo?.unitCost || 1;
            // update userUsageStat credit used
            userUsageStat.credit.used += unitCost;
            await userUsageStat.save();
            return next();
          }
          break;
        }

        case "maxTokens": {
          const { tokenUsed = 0, totalRunTokenUsed = 0 } = userUsageStatJSON;
          if (
            tokenUsed + totalRunTokenUsed <
            subscriptionfeature.features.maxTokens
          ) {
            return next();
          }

          // Allow if the user has credits
          if (hasCreditsLeft) {
            req.useCredit = true;
            return next();
          }
          break;
        }

        case "maxUserAgentCount": {
          if (
            userUsageStatJSON.userAgentCount <
            subscriptionfeature.features.maxUserAgentCount
          ) {
            return next();
          }

          // Allow if the user has credits
          if (hasCreditsLeft) {
            const unitCost = statsPrice.features?.userAgent?.unitCost || 1;
            // update userUsageStat credit used
            userUsageStat.credit.used += unitCost;
            await userUsageStat.save();
            return next();
          }
          break;
        }

        case "speechToTextCount": {
          if (subscriptionfeature.features.speechToTextCount.unlimited) {
            return next();
          }

          // Allow if the user has credits
          if (hasCreditsLeft) {
            const unitCost = statsPrice.features?.speechToText?.unitCost || 1;
            // update userUsageStat credit used
            userUsageStat.credit.used += unitCost;
            await userUsageStat.save();
            return next();
          }
          break;
        }

        // handle entities count
        case "ENTITY_BULK_UPLOAD_VIA_CSV":
        case "MULTIPLE_ENTITIES": {
          // count requested entities
          let requestedSingleEntityCount = 0;
          let requestedDoubleEntityCount = 0;
          if (key === "MULTIPLE_ENTITIES") {
            const entities = req.body;
            // Check if entities is an array and it has items
            if (!Array.isArray(entities) || entities.length === 0) {
              return next();
            }

            for (const entity of entities) {
              const { sourceType, subSetType } = entity;
              if (isDoubleStepApifyProcess({ sourceType, subSetType })) {
                requestedDoubleEntityCount += 1;
              } else {
                requestedSingleEntityCount += 1;
              }
            }
          } else if (key === "ENTITY_BULK_UPLOAD_VIA_CSV") {
            if (!req.file) return next();
            const entities = await csv().fromString(
              req.file?.buffer?.toString("utf-8")
            );
            // Check if entities is an array and it has items
            if (!Array.isArray(entities) || entities.length === 0) {
              return next();
            }

            for (const entity of entities) {
              const { Source: source, URL: url, Type: type } = entity;
              if (
                isDoubleStepApifyProcess({
                  sourceType: source?.toLowerCase()?.trim(),
                  subSetType: type?.toLowerCase()?.trim(),
                })
              ) {
                requestedDoubleEntityCount += 1;
              } else {
                requestedSingleEntityCount += 1;
              }
            }
          }

          // used entities count
          let {
            doubleStepCount: usedDynamicEntityCount,
            singleStepCount: usedStaticEntityCount,
          } = getSingleAndDoubleEntityCount(userUsageStatJSON.entityCount);

          // remaining entities count
          const remainingStaticCount =
            subscriptionfeature.features.maxStaticDataSourceCount -
            usedStaticEntityCount;
          const remainingDynamicCount =
            subscriptionfeature.features.maxDynamicDataSourceCount -
            usedDynamicEntityCount;

          if (
            requestedSingleEntityCount <= remainingStaticCount &&
            requestedDoubleEntityCount <= remainingDynamicCount
          ) {
            return next();
          }

          // Allow if the user has credits
          if (userUsageStat?.credit?.used < userUsageStat?.credit?.total) {
            // update userUsageStat credit used
            const staticUnitCost =
              statsPrice.features?.staticDataSource?.unitCost || 1;
            const dynamicUnitCost =
              statsPrice.features?.dynamicDataSource?.unitCost || 1;
            const creditUsed =
              staticUnitCost * requestedSingleEntityCount +
              dynamicUnitCost * requestedDoubleEntityCount;
            userUsageStat.credit.used += creditUsed;
            await userUsageStat.save();
            return next();
          }

          break;
        }

        default:
          return next(
            new SubscriptionError(
              `Usage limit exceeded or not supported in your plan`
            )
          );
      }
      return next(
        new SubscriptionError(
          `Usage limit exceeded or not supported in your plan`
        )
      );
    } catch (error) {
      next(error);
    }
  };
}

export async function checkUsageStatBeforeDowngrade(
  stripePriceId: string,
  userId: string
) {
  // find subscriptionPlan
  const subscriptionPlan = await findOneSubscriptionPlan({
    stripePriceId: stripePriceId,
  });
  if (!subscriptionPlan) {
    throw new RequestError(
      `subscriptionPlan with stripePriceId=${stripePriceId} not found`,
      404
    );
  }

  // find subscriptionFeature
  const subscriptionFeature = await findOneSubscriptionFeature({
    subscriptionPlan: subscriptionPlan._id,
  });
  if (!subscriptionFeature) {
    throw new RequestError(
      `subscriptionFeature with subscriptionPlan=${subscriptionPlan._id} not found`,
      404
    );
  }

  // find user usage stat document
  const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
    { userId: userId },
    {},
    { upsert: true, new: true }
  );
  if (!userUsageStat) {
    throw new RequestError("UserUsageStat document not found", 404);
  }
  const userUsageStatJSON = userUsageStat.toJSON();

  // check entity count static and dynamic
  const {
    doubleStepCount: usedDynamicEntityCount,
    singleStepCount: usedStaticEntityCount,
  } = getSingleAndDoubleEntityCount(userUsageStatJSON.entityCount);
  const {
    features: {
      maxDynamicDataSourceCount,
      maxLocalFileSourceCount = 0,
      maxStaticDataSourceCount,
      maxUserAgentCount,
    },
  } = subscriptionFeature;

  const errorMessages = [];

  if (usedStaticEntityCount > maxStaticDataSourceCount) {
    errorMessages.push(`static sources (maximum: ${maxStaticDataSourceCount})`);
  }
  if (usedDynamicEntityCount > maxDynamicDataSourceCount) {
    errorMessages.push(
      `dynamic sources (maximum: ${maxDynamicDataSourceCount})`
    );
  }

  // check local entity count
  if (userUsageStat?.localEntityCount > maxLocalFileSourceCount) {
    errorMessages.push(`Local File Source (maximum: ${maxLocalFileSourceCount})`);
  }

  // check userAgentCount
  if (userUsageStat.userAgentCount > maxUserAgentCount) {
    errorMessages.push(`agents (maximum: ${maxUserAgentCount})`);
  }

  // Check if there are any errors
  if (errorMessages.length > 0) {
    const errorMessage = `You must have up to ${errorMessages.join(
      ", "
    )} to downgrade. Delete some.`;
    throw new RequestError(errorMessage, 403);
  }
}