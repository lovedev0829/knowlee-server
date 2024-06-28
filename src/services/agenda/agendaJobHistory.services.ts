import { FilterQuery, ProjectionType, QueryOptions } from "mongoose";
import AgendaJobHistoryModel, {
    IAgendaJobHistoryDocument,
} from "../../models/agenda/AgendaJobHistory";

export async function findAgendaJobHistoryDocuments(
    filter: FilterQuery<IAgendaJobHistoryDocument>,
    projection?: ProjectionType<IAgendaJobHistoryDocument>,
    options?: QueryOptions<IAgendaJobHistoryDocument>
) {
    return await AgendaJobHistoryModel.find(filter, projection, options);
}

export async function createOneAgendaJobHistory(
    doc: Partial<IAgendaJobHistoryDocument>
) {
    const agendaJobHistory = new AgendaJobHistoryModel(doc);
    return await agendaJobHistory.save();
}

export const deleteManyAgendaJobHistory = async (
    filter?: FilterQuery<IAgendaJobHistoryDocument>,
    options?: QueryOptions<IAgendaJobHistoryDocument>
) => {
    return await AgendaJobHistoryModel.deleteMany(filter, options);
};
