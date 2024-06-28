import { RequestError } from "../utils/globalErrorHandler";
import { sendResponse } from "../utils/response.utils";
import { Request, Response } from "express";
import { UserModel } from "../models/user.model";
import { NotificationModel } from "../models/notification.model";
import { Notification } from "../types/notifications";


export const getUserNotifications = async (req: Request, res: Response) => {
  if (!req.user) throw new RequestError("Could not verify user", 401);
  const now = new Date();
  try {
    const { id: userId } = req.user
    const notifications = await NotificationModel.find(
      { userId, createdAt: { $lte: now } },
      null,
      { sort: { createdAt: -1 } }
    )
    // .limit(10)

    return sendResponse(res, 200, "", notifications);

  } catch (error) {
    throw new RequestError(`Something went wrong when getting user notifications: ${error}`, 500)
  }
}

export const createGlobalNotifications = async (req: Request, res: Response) => {

  try {
    const { title, message, url, createdAt } = req.body
    const users = await UserModel.find({});

    // Create a notification for each user
    const globalNotifications = users.map((user) => {
      return new NotificationModel({
        userId: user.id,
        title,
        message,
        url,
        createdAt,
      })
    });

    await NotificationModel.insertMany(globalNotifications);

    return sendResponse(res, 200, "Global notification created successfully");
  } catch (error) {
    throw new RequestError(`Something went wrong when creating a global notification: ${error}`, 500)
  }
}


export const createUserNotifications = async (req: Request, res: Response) => {

  try {
    const { userId, title, message, url, createdAt } = req.body
    const newNotification = new NotificationModel({
      userId,
      title,
      message,
      url,
      createdAt,
    })

    const savedNotification = await newNotification.save()
    return sendResponse(res, 200, "", savedNotification);

  } catch (error) {
    throw new RequestError(`Something went wrong when creating a user notification: ${error}`, 500)
  }
}

export const markNotificationsAsViewed = async (req: Request, res: Response) => {

  try {
    const notificationsIds = req.body as string[]
    const markedNotifications = await NotificationModel.updateMany(
      { id: { $in: notificationsIds } },
      { $set: { isViewed: true } },
      { multi: true },
    )

    return sendResponse(res, 200, "", markedNotifications);
  } catch (error) {
    throw new RequestError(`Something went wrong when marking as viewed: ${error}`, 500)
  }
}

export const markNotificationsAsUnread = async (req: Request, res: Response) => {

  try {
    const notificationsIds = req.body as string[]
    const markedNotifications = await NotificationModel.updateMany(
      { id: { $in: notificationsIds } },
      { $set: { isViewed: false } },
      { multi: true },
    )

    return sendResponse(res, 200, "Success.", markedNotifications);

  } catch (error) {
    throw new RequestError(`Something went wrong when marking as unread: ${error}`, 500)
  }
}

export const deleteNotification = async (req: Request, res: Response) => {

  try {
    const { notificationId } = req.params
    const deletedNotification = await NotificationModel.deleteOne(
      { id: notificationId },
    )

    return sendResponse(res, 200, "", deletedNotification);

  } catch (error) {
    throw new RequestError(`Something went wrong when deleting notification: ${error}`, 500)
  }
}

