import mongoose, { Document, Schema } from "mongoose";
import { Assistant } from "openai/resources/beta/assistants";

export const OpenAIAssistantSchema = new Schema<Assistant>({
    id: {
        type: String,
        required: true,
    },
    created_at: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        maxLength: 512,
        default: null,
    },
    instructions: {
        type: String,
        maxLength: 32768,
        default: null,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    model: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        maxLength: 256,
        default: null,
    },
    object: {
        type: String,
        default: "assistant",
        enum: ["assistant"],
    },
    tools: {
        type: [
            {
                type: {
                    type: String,
                    enum: ["code_interpreter", "file_search", "function"],
                },
            },
        ],
        default: [],
    },
});

export interface IDefaultAgentDocument extends Document {
    assistant: Assistant;
    // assistantId: string;
    createdAt: Date;
    entityIds: string[];
    updatedAt: Date;
    creatorId: string;
    initialPrompts: string[];
}   

const defaultAgentSchema = new Schema<IDefaultAgentDocument>(
    {
        assistant: {
            type: OpenAIAssistantSchema,
            required: true,
        },
        // assistantId: {
        //     type: String,
        //     required: true,
        // },
        entityIds: {
            type: [
                {
                    type: String,
                    ref: "Entity",
                }
            ],
            default: [],
        },
        initialPrompts: {
            type: [String],
            default: [],
        },
        creatorId: {
            type: String,
            ref: "User",
            required: true,
        },
    },
    {
        strict: false,
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        collection: "defaultagents"
    }
);

defaultAgentSchema.virtual("creator", {
    ref: "User",
    localField: "creatorId",
    foreignField: "id",
    justOne: true,
});


defaultAgentSchema.virtual("entities", {
    ref: "Entity",
    localField: "entityIds",
    foreignField: "id",
});

const DefaultAgentModel = mongoose.model<IDefaultAgentDocument>(
    "DefaultAgent",
    defaultAgentSchema
);

export default DefaultAgentModel;
