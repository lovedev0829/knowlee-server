import { FilterQuery, ProjectionType, QueryOptions, UpdateQuery } from "mongoose";
import { ISubscriptionFeature, SubscriptionFeature } from "../../models/subscriptionFeature.model";

export const findOneSubscriptionFeature = async (
    filter?: FilterQuery<ISubscriptionFeature>,
    projection?: ProjectionType<ISubscriptionFeature>,
    options?: QueryOptions<ISubscriptionFeature>
) => {
    return await SubscriptionFeature.findOne(filter, projection, options);
};

export const deleteManySubscriptionFeatures = async (
    filter?: FilterQuery<ISubscriptionFeature>,
    options?: QueryOptions<ISubscriptionFeature>
) => {
    return await SubscriptionFeature.deleteMany(filter, options);
};


export const findOneAndUpdateSubscriptionFeature = async (
    filter?: FilterQuery<ISubscriptionFeature>,
    update?: UpdateQuery<ISubscriptionFeature>,
    options?: QueryOptions<ISubscriptionFeature>
) => {
    return await SubscriptionFeature.findOneAndUpdate(filter, update, options);
};


export async function findSubscriptionFeature(
    filter: FilterQuery<ISubscriptionFeature>,
    projection?: ProjectionType<ISubscriptionFeature>,
    options?: QueryOptions<ISubscriptionFeature>
) {
    return SubscriptionFeature.find(filter, projection, options);
}

export async function createSubscriptionFeature(doc: Partial<ISubscriptionFeature>) {
    return await SubscriptionFeature.create(doc);
}
