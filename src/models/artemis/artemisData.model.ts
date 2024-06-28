import mongoose, { Document, Schema } from "mongoose";

export interface IArtemisData extends Document {
    artemisId: string;
    assetName: string;
    metric: string;
    data: any;
}

const ArtemisDataSchema = new Schema<IArtemisData>(
    {
        artemisId: {
            type: String,
        },
        assetName: {
            type: String,
        },
        metric: {
            type: String,
        },
        data: {
            type: Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
    }
);

const ArtemisDataModel = mongoose.model<IArtemisData>(
    "ArtemisData",
    ArtemisDataSchema,
    "artemisdata",
);

export default ArtemisDataModel;
