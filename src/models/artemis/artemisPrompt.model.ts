import mongoose, { Document, Schema } from "mongoose";

export interface IArtemisPromptDocument extends Document {
    metric: string;
    prompt: string;
}

const ArtemisPromptSchema = new Schema<IArtemisPromptDocument>(
    {
        metric: {
            type: String,
        },
        prompt: {
            type: String,
        },
    },
);

const ArtemisPromptModel = mongoose.model<IArtemisPromptDocument>(
    "ArtemisPrompt",
    ArtemisPromptSchema
);

export default ArtemisPromptModel;
