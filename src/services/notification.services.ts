import { INotification, NotificationModel } from "../models/notification.model";

export async function createOneUserNotification(doc: Partial<INotification>) {
    return await NotificationModel.create(doc);
}