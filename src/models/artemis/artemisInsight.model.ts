import mongoose, { Document, Schema } from "mongoose";

export interface IArtemisInsight extends Document {
    artemisId: string;
    insight: string;
    metric: string;
}

const ArtemisInsightSchema = new Schema<IArtemisInsight>(
    {
        artemisId: {
            type: String,
        },
        insight: {
            type: String,
        },
        metric: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const ArtemisInsightModel = mongoose.model<IArtemisInsight>(
    "ArtemisInsight",
    ArtemisInsightSchema
);

export default ArtemisInsightModel;
