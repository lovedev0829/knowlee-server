import { FilterQuery, ProjectionType, QueryOptions } from "mongoose";
import ArtemisPromptModel, {
    IArtemisPromptDocument,
} from "../../models/artemis/artemisPrompt.model";

export async function findArtemisPromptDocuments(
    filter: FilterQuery<IArtemisPromptDocument>,
    projection?: ProjectionType<IArtemisPromptDocument>,
    options?: QueryOptions<IArtemisPromptDocument>
) {
    return await ArtemisPromptModel.find(filter, projection, options);
}

export const findOneArtemisPromptDocument = async (
    filter?: FilterQuery<IArtemisPromptDocument>,
    projection?: ProjectionType<IArtemisPromptDocument>,
    options?: QueryOptions<IArtemisPromptDocument>
) => {
    return await ArtemisPromptModel.findOne(filter, projection, options);
};
