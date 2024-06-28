import { FilterQuery, ProjectionType, QueryOptions } from "mongoose";
import ArtemisQueryParamModel, { IArtemisQueryParams } from "../../models/artemis/artemisQueryParam.model";

export async function findArtemisQueryParams(
    filter: FilterQuery<IArtemisQueryParams>,
    projection?: ProjectionType<IArtemisQueryParams>,
    options?: QueryOptions<IArtemisQueryParams>
) {
    return await ArtemisQueryParamModel.find(filter, projection, options);
}

export const findOneArtemisQueryParam = async (
    filter?: FilterQuery<IArtemisQueryParams>,
    projection?: ProjectionType<IArtemisQueryParams>,
    options?: QueryOptions<IArtemisQueryParams>
) => {
    return await ArtemisQueryParamModel.findOne(filter, projection, options);
};