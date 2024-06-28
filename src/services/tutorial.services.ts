import { FilterQuery, ProjectionType, QueryOptions } from "mongoose";
import TutorialModel, { ITutorial } from "../models/Tutorial.model";

export async function findTutorialDocuments(
    filter: FilterQuery<ITutorial>,
    projection?: ProjectionType<ITutorial>,
    options?: QueryOptions<ITutorial>
) {
    return await TutorialModel.find(filter, projection, options);
}
