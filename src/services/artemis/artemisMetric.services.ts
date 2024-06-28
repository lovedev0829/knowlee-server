import { FilterQuery, ProjectionType, QueryOptions } from "mongoose";
import ArtemisMetricModel, { IArtemisMetric } from "../../models/artemis/artemisMetric.model";

export async function findArtemisMetrics(
    filter: FilterQuery<IArtemisMetric>,
    projection?: ProjectionType<IArtemisMetric>,
    options?: QueryOptions<IArtemisMetric>
) {
    return await ArtemisMetricModel.find(filter, projection, options);
}

export const findOneArtemisMetric = async (
    filter?: FilterQuery<IArtemisMetric>,
    projection?: ProjectionType<IArtemisMetric>,
    options?: QueryOptions<IArtemisMetric>
) => {
    return await ArtemisMetricModel.findOne(filter, projection, options);
};