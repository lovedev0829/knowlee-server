import { ClientSession, FilterQuery, ProjectionType, QueryOptions } from "mongoose";
import { User, UserModel } from "../models/user.model";
import { UserDto } from "../types/user";
import { UserKnowledgeModel } from "../models/userKnowledge.model";
import { UserSettingModel } from "../models/userSetting.modal";
import { RequestError } from "../utils/globalErrorHandler";
import { DEFAULT_USER_SETTINGS, NO_MERKETING_USER_SETTINGS, STRING_FALSE } from "../utils/constants";
import { findOneAndUpdateUserUsageStatDocument } from "./userUsageStat.services";
// import { deletePinconeVector } from "./pinecone.services";
import { deleteManyUserSettings } from "./userSetting.service";
import { deleteManyUserKnowledges } from "./userKnowledge.services";
import { deleteManyDashboardSummaries } from "./dashboardsummary.services";
import { deleteManyEmailDocuments } from "./email.services";
import { deleteManyConversations } from "./conversation.services";
// import { deleteManyUserVectors } from "./userVector.services";
import { deleteManyUserSegmentations } from "./userSegmentation.services";
import { deleteManyUserAgent } from "./knowlee-agent/agent.services";
import { deleteManyUserThreads } from "./knowlee-agent/userThread.services";
import { brevoCreateContact } from "./brevo.service";
import { auth0LinkUserAccount } from "../lib/auth0.services";
import { updateSignUpStatus } from "../utils/userReferral.utils";
import { deleteManyUserSubscriptionDocuments } from "./stripe/userSubscription.service";
import { deleteManyThirdPartyConfig } from "./thirdPartyConfig.services";

export const marketingListId = 6;

export const getUser = async (userId: string, session?: ClientSession) => {
  const user = await UserModel.findOne(
    { id: userId },
    {},
    { session: session }
  );

  return user;
};

export const createNewUser = async (
  email: string,
  auth0Id: string,
  session?: ClientSession
) => {
  const newUser = new UserModel({
    email,
    auth0Id,
  });

  await newUser.save({ session });
  return newUser;
};

export const createNewUserKnowledge = async (
  userId: string,
  session?: ClientSession
) => {
  const newUserKnowledge = new UserKnowledgeModel({
    userId,
    entities: [],
  });

  await newUserKnowledge.save({ session });
};

export const getUserByEmail = async (
  email: string,
  session?: ClientSession
) => {
  const user = await UserModel.findOne({ email }, {}, { session: session });

  return user;
};

export const updateUser = async (
  userId: string,
  payload: UserDto,
  session?: ClientSession
) => {
  const user = await UserModel.findOneAndUpdate({ id: userId }, payload, {
    new: true,
    session: session,
  });

  return user;
};

export async function findOneUser(
  filter?: FilterQuery<User>,
  projection?: ProjectionType<User>,
  options?: QueryOptions<User>
) {
  return await UserModel.findOne(filter, projection, options);
};

export const getUserByAuth0Id = async (
  auth0Id: string,
  session?: ClientSession
) => {
  const user = await UserModel.findOne({ auth0Id }, {}, { session: session });

  return user;
};

export const handleUserCreation = async (user: any, session: ClientSession, connection?: unknown) => {
  const { email, user_id, user_metadata, email_verified } = user;

  if (!email) throw new RequestError("Invalid fields", 400);

  const existingUser = await findOneUser({ email });

  if (existingUser && connection) {
    const { auth0Id } = existingUser;
    // check for auth0Id if not match link both accounts
    if (auth0Id !== user_id) {
      // // can not proceed because email is not verified
      // if (auth0Id.startsWith("auth0|") && !email_verified) {
      //   console.log("handleUserCreation: Email not verified");
      //   return existingUser;
      // }
      // await auth0LinkUserAccount({
      //   primaryAccountUserId: auth0Id,
      //   secondaryAccountUserId: user_id,
      //   connection: connection,
      // });
    }
    return existingUser;
  } 

  const newUser = await createNewUser(email, user_id, session);
  await createNewUserKnowledge(newUser.id, session);
  await updateSignUpStatus(email,user.created_at);

  const shouldNotReceiveMarketing = user_metadata?.newsletter === STRING_FALSE || !user_metadata?.newsletter;
  const appropriateSettings = shouldNotReceiveMarketing ? NO_MERKETING_USER_SETTINGS : DEFAULT_USER_SETTINGS;

  await brevoCreateContact({
    email: user.email,
    attributes: {
      // USERID: newUser.id,
      FIRSTNAME: user.given_name,
      LASTNAME: user.family_name,
      MARKETING_SUBSCRIPTION: shouldNotReceiveMarketing,   

      // following data wil be updated later
      PROFESSION: ""
    },
    listIds: [marketingListId],
  })

  const newUserSetting = {
    ...appropriateSettings,
    user: newUser.id,
  };

  await new UserSettingModel(newUserSetting).save({ session });
  return newUser;

};


export const countUser = async (
  filter?: FilterQuery<User>,
) => {
  return await UserModel.count(filter);
};

export async function findUser(
  filter: FilterQuery<User>,
  projection?: ProjectionType<User>,
  options?: QueryOptions<User>
) {
  return await UserModel.find(filter, projection, options);
}

// export async function migrateTokenUsageToUserUsage() {
//   // get all users
//   const userList = await findUser({});

//   // for each user
//   for (const user of userList) {
//     //console.log("userId----->", user.id);
//     //console.log("max_tokens----->", user.max_tokens);
//     //console.log("token_used----->", user.token_used);
//     await findOneAndUpdateUserUsageStatDocument(
//       { userId: user.id },
//       {
//         $set: {
//           maxToken: user.max_tokens || 500000,
//           tokenUsed: user.token_used || 0,
//         },
//       },
//       { upsert: true, new: true }
//     );
//   }

//   await UserModel.updateMany(
//     {},
//     {
//       $unset: {
//         max_tokens: 0,
//         token_used: 0,
//       },
//     }
//   );

//   //console.log("DONE: migrateTokenUsageToUserUsage");
// }

export async function deleteAllDataOfUser(user: User, session: ClientSession) {
  const { id: userId, _id: user_id } = user;
  const promiseList = [];

  // detete pinecone namespace
  // promiseList.push(deletePinconeVector({ deleteAll: true, namespace: userId }));

  // delete usersettings
  promiseList.push(
    deleteManyUserSettings({ user: userId }, { session: session })
  );

  // delete userknowledges
  promiseList.push(
    deleteManyUserKnowledges({ userId: userId }, { session: session })
  );

  // delete dashboardsummary
  promiseList.push(
    deleteManyDashboardSummaries({ id: userId }, { session: session })
  );

  // delete emails
  promiseList.push(
    deleteManyEmailDocuments({ id: userId }, { session: session })
  );

  // delete conversation
  // delete queryquestions - it will also delete all queryquestions
  promiseList.push(
    deleteManyConversations({ user: user_id }, { session: session })
  );

  // delete referralcodes
  // There is no model for referralcodes

  // delete uservectors
  // promiseList.push(
  //   deleteManyUserVectors({ userId: userId }, { session: session })
  // );

  // delete usersegmentations
  promiseList.push(
    deleteManyUserSegmentations({ userId: userId }, { session: session })
  );

  // delete user agents
  promiseList.push(
    deleteManyUserAgent({ creatorId: userId }, { session: session })
  );

  // delete user threads
  promiseList.push(
    deleteManyUserThreads({ creatorId: userId }, { session: session })
  );

  // delete usersubscriptions
  promiseList.push(
    deleteManyUserSubscriptionDocuments(
      { userId: userId },
      { session: session }
    )
  );

  // delete thirdPartyConfig
  promiseList.push(
    deleteManyThirdPartyConfig({ userId: userId }, { session: session })
  );

  // wait for deletion of user's all documents
  await Promise.all(promiseList);
}