import mongoose, { Document, Schema } from "mongoose";

export interface IArtemisMetric extends Document {
    description: string;
    metric: string;
    supportsDate: boolean;
    updateFrequency: string;
}

const artemisMetricSchema = new Schema<IArtemisMetric>({
    description: {
        type: Schema.Types.Mixed,
    },
    metric: {
        type: String,
        required: true,
    },
    supportsDate: {
        type: Boolean,
    },
    updateFrequency: {
        type: String,
    },
});

const ArtemisMetricModel = mongoose.model<IArtemisMetric>(
    "ArtemisMetric",
    artemisMetricSchema
);

export default ArtemisMetricModel;
