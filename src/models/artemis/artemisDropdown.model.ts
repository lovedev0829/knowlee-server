import mongoose, { Document, Schema } from "mongoose";

export interface IArtemisDropdown extends Document {
    dropdown: string;
    type: string;
    values: any;
}

const artemisDropdownSchema = new Schema<IArtemisDropdown>({
    dropdown: { type: String },
    values: { type: Schema.Types.Mixed },
    type: { type: String },
});

const ArtemisDropdownModel = mongoose.model<IArtemisDropdown>(
    "ArtemisDropdown",
    artemisDropdownSchema,
    "artemisdropdown"
);

export default ArtemisDropdownModel;
