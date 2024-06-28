import mongoose, { Schema, Document } from "mongoose";

export interface ITutorial extends Document {
    createdAt: Date;
    date: Date;
    description?: string;
    icon: string;
    iframeSrc?: string;
    title: string;
    updatedAt: Date;
    youTubeVideo?: string;
}

const tutorialSchema = new Schema<ITutorial>(
    {
        date: { type: Date, default: Date.now, required: true },
        description: { type: String },
        icon: { type: String, required: true },
        iframeSrc: { type: String },
        title: { type: String, required: true },
        youTubeVideo: { type: String },
    },
    {
        timestamps: true,
    }
);

const TutorialModel = mongoose.model<ITutorial>("Tutorial", tutorialSchema);

export default TutorialModel;
