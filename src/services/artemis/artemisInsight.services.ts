import { FilterQuery, ProjectionType, QueryOptions } from "mongoose";
import ArtemisInsightModel, {
    IArtemisInsight,
} from "../../models/artemis/artemisInsight.model";

export async function findArtemisInsights(
    filter: FilterQuery<IArtemisInsight>,
    projection?: ProjectionType<IArtemisInsight>,
    options?: QueryOptions<IArtemisInsight>
) {
    return await ArtemisInsightModel.find(filter, projection, options);
}

export const findOneArtemisInsight = async (
    filter?: FilterQuery<IArtemisInsight>,
    projection?: ProjectionType<IArtemisInsight>,
    options?: QueryOptions<IArtemisInsight>
) => {
    return await ArtemisInsightModel.findOne(filter, projection, options);
};

export async function insertManyArtemisInsights(data: unknown[]) {
    const newArtemisInsights = data.map((artemisInsight) => {
        return new ArtemisInsightModel(artemisInsight);
    });

    await ArtemisInsightModel.insertMany(newArtemisInsights);
    return newArtemisInsights;
}
