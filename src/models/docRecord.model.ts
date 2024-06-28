import { model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IDocRecord extends Document {
    content: unknown;
    createdAt: Date;
    entityId: string;
    extractionDate: Date;
    id: string;
    metadata: unknown;
    fileType: string;
    updatedAt: Date;
}

const DocRecordSchema = new Schema<IDocRecord>(
    {
    content: { type: Schema.Types.Mixed },
        entityId: {
            type: String,
            ref: "Entity",
            required: true,
        },
        extractionDate: { type: Date, default: Date.now },
    id: {
        type: String,
        default: uuidv4,
        required: true,
        unique: true,
    },
    metadata: { type: Schema.Types.Mixed },
    fileType: { type: String, required: true },
    },
    {
        strict: false,
        timestamps: true,
    }
);

DocRecordSchema.virtual('entity', {
    ref: 'Entity',
    localField: 'entityId',
    foreignField: 'id'
});

export const DocRecordModel = model<IDocRecord>("DocRecord", DocRecordSchema);
