import mongoose, { Document, Schema } from "mongoose";

export interface IArtemisQueryParams extends Document {
    type: string;
    values: any;
}

const artemisQueryParamSchema = new Schema<IArtemisQueryParams>({
    type: { type: String },
    values: { type: Schema.Types.Mixed },
});

const ArtemisQueryParamModel = mongoose.model<IArtemisQueryParams>(
    "ArtemisQueryParam",
    artemisQueryParamSchema
);

export default ArtemisQueryParamModel;
