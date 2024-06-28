import { Request, Response } from 'express';
import {
  findOneAndUpdateUserSetting,
  getUserSetting,
  updateUserSetting,
} from "../services/userSetting.service";
import { RequestError } from '../utils/globalErrorHandler';
import { sendResponse } from '../utils/response.utils';
import { brevoGetContact, brevoUpdateContact } from '../services/brevo.service';
import { getUser } from '../services/user.services';
import { UserSettingModel } from "../models/userSetting.modal";

export const get = async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!userId) throw new RequestError("userId is required!", 400);

  const userSetting = await findOneAndUpdateUserSetting(
    { user: userId },
    {},
    { upsert: true, new: true }
  );

  return sendResponse(res, 200, "", userSetting);
}

export const update = async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!userId) throw new RequestError("userId is required!", 400);

  const setting = await getUserSetting(userId);
  if (!setting) throw new RequestError("User setting does not exist", 404);

  const { user, _id, ...payload } = req.body;
  const newSetting = await updateUserSetting(userId, payload);
  if (!newSetting) throw new RequestError("User settings does not exists", 404);

  const userData = await getUser(userId)
  if(!userData) throw new RequestError("User does not exist", 404);
  let { email } = userData
  const contact = await brevoGetContact(email)
  if(contact) {
    const attributes = {
      ...contact.body.attributes,
      MARKETING_SUBSCRIPTION: newSetting.notification.emailSpecialOffersAndPromotions
    }
    
    await brevoUpdateContact(email, {
      attributes: attributes
    })
  }

  return sendResponse(res, 200, "", newSetting);
}