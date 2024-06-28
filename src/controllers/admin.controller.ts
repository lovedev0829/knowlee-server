import { Request, Response } from "express";
import { sendResponse } from "../utils/response.utils";
import { countUser, deleteAllDataOfUser, getUser } from "../services/user.services";
import {
  countUserKnowledge,
  findOneUserKnowledge,
  findUserKnowledge,
} from "../services/userKnowledge.services";
import { getUsersLoggedInLast24Hours } from "../lib/auth0.services";
import {
  countUserUsageStat,
  getTotalTokenUsed,
} from "../services/userUsageStat.services";
import { RequestError } from "../utils/globalErrorHandler";
import { ClientSession } from "mongoose";
import {
  findDistinctEntities,
  getAllDoubleStepScheduledEntities,
} from "../services/entity.services";
import { findUserVector } from "../services/userVector.services";
import { pineconeFetch } from "../services/pinecone.services";
import { findDistinctLocalEntities } from "../services/localEntity.service";
import { stripeCustomersDel } from "../lib/stripe";

export async function getAdminDashboardStatsController(
  req: Request,
  res: Response
) {
  const { startDate, endDate } = req.query;

  // Convert date strings to Date objects
  const start = startDate ? new Date(startDate as string) : new Date(0); // Default to epoch if not provided
  const end = endDate ? new Date(endDate as string) : new Date(); // Default to current date if not provided

  const dateFilter = { createdAt: { $gte: start, $lte: end } };

  const adminDashboardStats = {
    userRegistered: 0,
    userWithSourcesGreaterThan1: 0,
    userWithTokenUsageMoreThan1: 0,
    userWithChatUsageMoreThan1: 0,
    userWithAgentUsageMoreThan1: 0,
    userWithProcessUsageMoreThan1: 0,
    userLoggedin24h: 0,
    userWithTokenUsageMoreThan250: 0,
    averageTokenUsagePerCustomer: 0,
  };
  // Users Registered (count of docs in users collection)
  const userRegistered = await countUser(dateFilter);
  adminDashboardStats.userRegistered = userRegistered;

  // Users with Sources > 1 (userknowledge entities array is not empty)
  const userWithSourcesGreaterThan1 = await countUserKnowledge({
    ...dateFilter,
    entities: { $exists: true, $ne: [] },
  });
  adminDashboardStats.userWithSourcesGreaterThan1 = userWithSourcesGreaterThan1;

  // Users with Token Usage > 1 (tokenUsed > 0)
  const userWithTokenUsageMoreThan1 = await countUserUsageStat({
    ...dateFilter,
    totalRunTokenUsed: { $gt: 0 },
  });
  adminDashboardStats.userWithTokenUsageMoreThan1 = userWithTokenUsageMoreThan1;

  // Users with Chat Usage > 1 (At least 1 chat)
  const userWithChatUsageMoreThan1 = await countUserUsageStat({
    ...dateFilter,
    userThreadCount: { $gt: 0 },
  });
  adminDashboardStats.userWithChatUsageMoreThan1 = userWithChatUsageMoreThan1;

  // Users with Agent Usage > 1 (At least 1 agent)
  const userWithAgentUsageMoreThan1 = await countUserUsageStat({
    ...dateFilter,
    userAgentCount: { $gt: 0 },
  });
  adminDashboardStats.userWithAgentUsageMoreThan1 = userWithAgentUsageMoreThan1;
  
  // Users with PRocess Usage > 1 (At least 1 process)
  const userWithProcessUsageMoreThan1 = await countUserUsageStat({
    ...dateFilter,
    userProcessCount: { $gt: 0 },
  });
  adminDashboardStats.userWithProcessUsageMoreThan1 = userWithProcessUsageMoreThan1;

  // at least a login in the last 24h (info that can be retrieved from auth0)
  const users = await getUsersLoggedInLast24Hours();
  const userLoggedin24h = users?.total || 0;
  adminDashboardStats.userLoggedin24h = userLoggedin24h;

  // Total Number of Users with Token Usage > 250
  const userWithTokenUsageMoreThan250 = await countUserUsageStat({
    ...dateFilter,
    totalRunTokenUsed: { $gt: 250 },
  });
  adminDashboardStats.userWithTokenUsageMoreThan250 = userWithTokenUsageMoreThan250;

  // Average Token Usage Per Customer (sum of all tokenUsed divided by number of users)
  const result = await getTotalTokenUsed(dateFilter);
  // //console.log("result----->", result);
  const totalTokenUsed = result[0]?.totalTokenUsed || 0;
  adminDashboardStats.averageTokenUsagePerCustomer = totalTokenUsed / userRegistered;

  return sendResponse(res, 200, "success", adminDashboardStats);
}

export async function deleteUserAdminController(
  req: Request,
  res: Response
) {
  const session: ClientSession = req.session!;
  const { userId } = req.params;
  if (!userId) throw new RequestError('userId field is required', 400);

  const user = await getUser(userId, session);
  if (!user) throw new RequestError('User not found', 404);
  const { stripeCustomerId } = user;

  await deleteAllDataOfUser(user, session);

  // delete actual user document
  await user.deleteOne({ session: session });

  if (stripeCustomerId) {
    // delete customer from stripe
    stripeCustomersDel(stripeCustomerId);
  }

  return sendResponse(res, 200, "User account deleted successfully.");
}

export async function unscheduleUnusedDoubleStepEntityController(
  req: Request,
  res: Response
) {
  // get all scheduled double step entity
  const scheduledDoubleStepEntities = await getAllDoubleStepScheduledEntities();

  let unscheduledcount = 0;

  for (const entity of scheduledDoubleStepEntities) {
    // check if entity is in userknowledge
    const userKnowledge = await findOneUserKnowledge({ entities: entity.id });
    if (userKnowledge) {
      continue;
    }

    // set isScheduled to false and save
    entity.isScheduled = false;
    await entity.save();
    unscheduledcount++;
  }

  return sendResponse(
    res,
    200,
    `Total ${unscheduledcount} double step entities unscheduled`
  );
}

export async function deleteUnusedVectorsController(
  req: Request,
  res: Response
) {
  let deleteVectorCount = 0;
  // find all userVectors
  const userVectors = await findUserVector({});

  // for each userVector
  for (const userVector of userVectors) {
    const { vectorsId, userId } = userVector;
    const ids = vectorsId.map((v) => v.id);
    const response = await pineconeFetch({ ids: ids, namespace: userId });
    //console.log("response----->", response);

    // check if vectors found in pinecone
    if (response.vectors && Object.keys(response.vectors).length) {
      continue;
    }

    // delete userVector as vectors does not exist in pinecone
    await userVector.deleteOne();
    deleteVectorCount++;
  }

  return sendResponse(
    res,
    200,
    `Total ${deleteVectorCount} unused vectors deleted`
  );
}

export async function cleanupUserKnowledgesController(
  req: Request,
  res: Response
) {

  // find all user knowledges
  // const userKnowledges = await findUserKnowledge({userId:"cdb2f409-39e1-4094-9a42-c55dd642bb88"});
  const userKnowledges = await findUserKnowledge({});

  for (const userKnowledge of userKnowledges) {
    if (!userKnowledge?.entities?.length) {
      // skip if entities array is empty
      continue;
    }
    // Find valid entities that exist in the Entity collection
    const validEntities = await findDistinctEntities({ id: { $in: userKnowledge.entities } }, "id");
    const validLocalEntities = await findDistinctLocalEntities({ id: { $in: userKnowledge.entities } }, "id");
    const updatedEntities = [...validEntities, ...validLocalEntities];
    // console.log("updatedEntities----->", updatedEntities);

    // Update user knowledge with valid entity IDs
    userKnowledge.entities = updatedEntities;
    userKnowledge.save();
  }

  return sendResponse(
    res,
    200,
    `User knowledge cleaned successfully.`
  );
}
