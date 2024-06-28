import {
  ClientSession,
  FilterQuery,
  QueryOptions,
  UpdateQuery,
} from "mongoose";
import { UserSettingModel } from '../models/userSetting.modal';
import { IPlayHTClonedVoice, UserSetting } from '../types/userSetting';


export const getUserSetting = async (userId: string, session?: ClientSession) => {
  const user = await UserSettingModel.findOne({ user: userId }, {}, { session });

  return user;
}

export const updateUserSetting = async (userId: string, payload: UserSetting, session?: ClientSession) => {
  const user = await UserSettingModel.findOneAndUpdate({ user: userId }, payload, { new: true });

  return user;
}

export const pushClonedVoiceToUserSetting = async (userId: string, playHTClonedVoices: IPlayHTClonedVoice[]) => {

  const userSetting = await UserSettingModel.findOneAndUpdate(
    { user: userId },
    {
      $push: { 'textToAudioSetting.clonedVoices': playHTClonedVoices },
    },
    { new: true, upsert: true }
  )


  return userSetting;
}


export const deleteManyUserSettings = async (
  filter?: FilterQuery<UserSetting>,
  options?: QueryOptions<UserSetting>
) => {
  return await UserSettingModel.deleteMany(filter, options);
};

export const findOneAndUpdateUserSetting = async (
  filter?: FilterQuery<UserSetting>,
  update?: UpdateQuery<UserSetting>,
  options?: QueryOptions<UserSetting>
) => {
  return await UserSettingModel.findOneAndUpdate(filter, update, options);
};
