import { Request, Response } from "express";
import {
  deleteAllDataOfUser,
  getUser,
  getUserByAuth0Id,
  handleUserCreation,
  updateUser
} from "../services/user.services";
import { sendResponse } from "../utils/response.utils";

import mongoose, { ClientSession } from "mongoose";
import { uploadAvatarOnS3Bucket } from "../services/upload.services";
import { RequestError } from "../utils/globalErrorHandler";
import { createOneUserNotification } from "../services/notification.services";
import { auth0DeleteUser } from "../lib/auth0.services";
import { stripeCustomersDel } from "../lib/stripe";

// This will be called on post signup action
export const create = async (req: Request, res: Response) => {
  const session: ClientSession = await mongoose.startSession();
  session.startTransaction();

  try {
    const { user, connection } = req.body;
    const newUser = await handleUserCreation(user, session, connection);
    
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ user_id: newUser._id, email: newUser.email });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new RequestError(`Something went wrong with universal login: ${error}`, 500);
  }
};

export const login = async (req: Request, res: Response) => {
  const session: ClientSession = req.session!;
  
  try {
    const { user } = req.body;
    const loggedInUser = await handleUserCreation(user, session);
    return res.status(200).json({ user_id: loggedInUser._id, email: loggedInUser.email });
  } catch (error) {
    throw new RequestError(
      `Something went wrong with universal login: ${error}`,
      500
    );
  }
};

export const get = async (req: Request, res: Response) => {
  //console.log("getting user normally");
  const { userAuth0Id } = req.params;
  //console.log("userAuth0Id", userAuth0Id);
  if (!userAuth0Id) throw new RequestError("userAuth0Id is required", 400);

  const user = await getUserByAuth0Id(userAuth0Id);
  if (!user) throw new RequestError("User does not exist", 404);
  return sendResponse(res, 200, "", user);
};

export const update = async (req: Request, res: Response) => {
  if (!req.user) throw new RequestError("Could not verify user", 401);
  const session: ClientSession = req.session!;

  const { id: userId } = req.user;
  if (!userId) throw new RequestError("User ID is required", 400);

  const userData = req.body;

  const avatarImage = req.file;
  if (avatarImage) {
    const bucketURL = await uploadAvatarOnS3Bucket(avatarImage, userId);
    if (!bucketURL)
      throw new RequestError("Failed to upload image to s3 bucket", 500);
    userData.profilePicture = bucketURL;
  }

  const user = await getUser(userId, session);
  // when user confirms TOS
  if (!user?.hasAcceptedTosPp && userData.hasAcceptedTosPp) {
    // create "Welcome to Knowlee!" notification
    await createOneUserNotification({
      userId: userId,
      title: "Welcome to Knowlee! 🌟",
      message:
        "You've successfully registered! Ready to transform information overload into actionable insights? Add your first source now!",
      url: "https://app.knowlee.com/knowledge-sources",
      isViewed: false,
    });
  }

  const updatedUser = await updateUser(userId, userData, session);

  return sendResponse(res, 200, "", updatedUser);
};

export const deleteUserAccountController = async (
  req: Request,
  res: Response
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (!req.user) throw new RequestError("Could not verify user", 401);

  const { id: userId, stripeCustomerId } = req.user;
  if (!userId) throw new RequestError("User ID is required", 400);

  // delete referralcodes
  // There is no model for referralcodes

  // // decrement totalEmbeddingTokenUsed
  // const userVectors = await findUserVector({ userId: userId });
  // let tokenToDecrement = 0;
  // userVectors.forEach((userVector) => {
  //   const embeddingTokenUsed = userVector.vectorsId?.reduce(
  //     (tokenCount, item) => {
  //       return tokenCount + (item?.token_count || 0);
  //     },
  //     0
  //   );
  //   tokenToDecrement -= embeddingTokenUsed;
  // });

  // findOneAndUpdateUserUsageStatDocument(
  //   { userId: userId },
  //   {
  //     $inc: {
  //       totalEmbeddingTokenUsed: tokenToDecrement,
  //     },
  //   },
  //   { upsert: true, new: true, session: session }
  // );

  // wait for deletion of user's all documents

  await deleteAllDataOfUser(req.user, session);

  // delete actual user document
  await req.user.deleteOne({ session: session });

    if (stripeCustomerId) {
      // delete customer from stripe
      stripeCustomersDel(stripeCustomerId);
    }
     
  // delete the user from auth0
  await auth0DeleteUser(req.user.auth0Id);

    // If everything succeeds, commit the transaction
    await session.commitTransaction();
    await session.endSession();

  return sendResponse(res, 200, "User account deleted successfully.");
  } catch (error) {
    // console.log(error);
    // If an error occurs, abort the transaction
    await session.abortTransaction();
    await session.endSession();
    sendResponse(res, 500, "Internal Server Error");
  }
};
