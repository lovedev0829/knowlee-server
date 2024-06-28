import { FilterQuery, ProjectionType, QueryOptions } from "mongoose";
import ArtemisDropdownModel, { IArtemisDropdown } from "../../models/artemis/artemisDropdown.model";

export async function findArtemisDropdownDocuments(
    filter: FilterQuery<IArtemisDropdown>,
    projection?: ProjectionType<IArtemisDropdown>,
    options?: QueryOptions<IArtemisDropdown>
) {
    return await ArtemisDropdownModel.find(filter, projection, options);
}

export const findOneArtemisDropdownDocument = async (
    filter?: FilterQuery<IArtemisDropdown>,
    projection?: ProjectionType<IArtemisDropdown>,
    options?: QueryOptions<IArtemisDropdown>
) => {
    return await ArtemisDropdownModel.findOne(filter, projection, options);
};