import mongoose, { Schema, Document } from "mongoose";

export type FunctionParameters = Record<string, unknown>;

export interface IOpenAIFunctionDefinition extends Document {
    createdAt: Date;
    updatedAt: Date;
    functionDefinition: {
        name: string;
        description?: string;
        parameters?: FunctionParameters;
    };
    label: string;
    functionType: string;
    onlySuperAdmin: boolean;
}

const OpenAIFunctionDefinitionSchema = new Schema<IOpenAIFunctionDefinition>(
    {
        functionDefinition: {
            name: {
                type: String,
                required: true,
            },
            description: {
                type: String,
            },
            parameters: {
                type: Schema.Types.Mixed,
            },
        },
        label: {
            type: String,
            required: true,
        },
        onlySuperAdmin: {
            type: Boolean,
            default: false,
        },
        functionType: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true }, 
        toObject: { virtuals: true },
    }
);

const OpenAIFunctionDefinitionModel = mongoose.model<IOpenAIFunctionDefinition>(
    "OpenAIFunctionDefinition",
    OpenAIFunctionDefinitionSchema
);

export default OpenAIFunctionDefinitionModel;
