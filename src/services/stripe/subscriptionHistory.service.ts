import { FilterQuery, ProjectionType, QueryOptions, UpdateQuery } from "mongoose";
import SubscriptionHistory, { SubscriptionHistoryDocument } from "../../models/subscriptionHistory.model";

export const findOneSubscriptionHistory = async (
    filter?: FilterQuery<SubscriptionHistoryDocument>,
    projection?: ProjectionType<SubscriptionHistoryDocument>,
    options?: QueryOptions<SubscriptionHistoryDocument>
) => {
    return await SubscriptionHistory.findOne(filter, projection, options);
};

export const deleteManySubscriptionHistoryDocuments = async (
    filter?: FilterQuery<SubscriptionHistoryDocument>,
    options?: QueryOptions<SubscriptionHistoryDocument>
) => {
    return await SubscriptionHistory.deleteMany(filter, options);
};


export const findOneAndUpdateSubscriptionHistory = async (
    filter?: FilterQuery<SubscriptionHistoryDocument>,
    update?: UpdateQuery<SubscriptionHistoryDocument>,
    options?: QueryOptions<SubscriptionHistoryDocument>
) => {
    return await SubscriptionHistory.findOneAndUpdate(filter, update, options);
};


export async function findSubscriptionHistory(
    filter: FilterQuery<SubscriptionHistoryDocument>,
    projection?: ProjectionType<SubscriptionHistoryDocument>,
    options?: QueryOptions<SubscriptionHistoryDocument>
) {
    return SubscriptionHistory.find(filter, projection, options);
}

export async function createSubscriptionHistory(doc: Partial<SubscriptionHistoryDocument>) {
    return await SubscriptionHistory.create(doc);
}
