import mongoose, { Document, Schema } from "mongoose";
import { JobAttributes } from "agenda";

export interface IAgendaJobHistoryDocument extends Document {
    createdAt: Date;
    error: Error;
    job: Partial<JobAttributes>;
    updatedAt: Date;
}

const agendaJobHistorySchema = new Schema<IAgendaJobHistoryDocument>(
    {
        error: { type: Schema.Types.Mixed },
        job: { type: Schema.Types.Mixed, required: true },
    },
    {
        timestamps: true,
    }
);

const AgendaJobHistoryModel = mongoose.model<IAgendaJobHistoryDocument>(
    "AgendaJobHistory",
    agendaJobHistorySchema
);

export default AgendaJobHistoryModel;
