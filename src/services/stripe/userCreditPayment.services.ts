import {
  FilterQuery,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
} from "mongoose";
import {
  IUserCreditPayment,
  UserCreditPayment,
} from "../../models/stripe/userCreditPayment.model";

export async function findUserCreditPaymentDocuments(
  filter: FilterQuery<IUserCreditPayment>,
  projection?: ProjectionType<IUserCreditPayment>,
  options?: QueryOptions<IUserCreditPayment>
) {
  return await UserCreditPayment.find(filter, projection, options);
}

export async function createOneUserCreditPaymentDocument(
  doc: Partial<IUserCreditPayment>
) {
  return await UserCreditPayment.create(doc);
}

export const findOneAndUpdateUserCreditPaymentDocument = async (
  filter?: FilterQuery<IUserCreditPayment>,
  update?: UpdateQuery<IUserCreditPayment>,
  options?: QueryOptions<IUserCreditPayment>
) => {
  return await UserCreditPayment.findOneAndUpdate(filter, update, options);
};

export const findByIdAndUpdateUserCreditPaymentDocument = async (
  id: string,
  update: UpdateQuery<IUserCreditPayment>
) => {
  return await UserCreditPayment.findByIdAndUpdate(id, update);
};

export const findByIdAndDeleteUserCreditPaymentDocument = async (
  id: string,
  options?: QueryOptions<IUserCreditPayment>
) => {
  return await UserCreditPayment.findByIdAndDelete(id, options);
};

export async function findOneUserCreditPaymentDocument(
  filter?: FilterQuery<IUserCreditPayment>,
  projection?: ProjectionType<IUserCreditPayment>,
  options?: QueryOptions<IUserCreditPayment>
) {
  return await UserCreditPayment.findOne(filter, projection, options);
}

export async function findByIdUserCreditPaymentDocument(id: string) {
  return await UserCreditPayment.findById(id);
}

export const countUserCreditPaymentDocument = async (
  filter?: FilterQuery<IUserCreditPayment>
) => {
  return await UserCreditPayment.count(filter);
};
