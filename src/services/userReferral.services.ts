import { FilterQuery, ProjectionType, QueryOptions, UpdateQuery } from "mongoose";
import UserReferralModel, { IUserReferral } from "../models/userReferral.model";


export async function findOneUserReferral(
  filter?: FilterQuery<IUserReferral>,
  projection?: ProjectionType<IUserReferral>,
  options?: QueryOptions<IUserReferral>
) {
  return await UserReferralModel.findOne(filter, projection, options);
};

export const findOneAndUpdateUserReferral = async (
  filter?: FilterQuery<IUserReferral>,
  update?: UpdateQuery<IUserReferral>,
  options?: QueryOptions<IUserReferral>
) => {
  return await UserReferralModel.findOneAndUpdate(filter, update, options);
};

export const findAndUpdateUserReferral = async (
  filter?: FilterQuery<IUserReferral>,
  update?: UpdateQuery<IUserReferral>,
  options?: QueryOptions<IUserReferral>
) => {
  return await UserReferralModel.updateMany(filter, update, options);
};
