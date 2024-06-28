import mongoose, { Document, Schema, Types } from "mongoose";
import { Assistant } from "openai/resources/beta/assistants";
import { openAIAssistantsDel } from "../../services/openAI.services";

export const OpenAIAssistantSchema = new Schema<Assistant>(
    {
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
    },
    {
        strict: false,
    }
);

export interface IUserAgentDocument extends Document {
    assistant: Assistant;
    // assistantId: string;
    avatar: Object;
    createdAt: Date;
    entityIds: string[];
    functionDefinitions: Types.ObjectId[];
    functionTypes: string[];
    openai_model: string;
    updatedAt: Date;
    creatorId: string;
    initialPrompts: string[];
    isDefaultAgentAdded: boolean;   
}   

const userAgentSchema = new Schema<IUserAgentDocument>(
    {
        avatar: {
            name: {
                type: String,
            },
            color: {
                type: String,
            },
        },
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
        functionDefinitions: {
            type: [{
                type: Schema.Types.ObjectId,
                ref: "OpenAIFunctionDefinition",
            }],
            default: []
        },
        functionTypes: {
            type: [String],
            default: [],
        },
        openai_model: {
            type: String,
            enum: ["gpt-3.5-turbo", "gpt-4o"],
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
        isDefaultAgentAdded: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: true,
        strict: false,      // to handle openAI assistant schema dynamically
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

userAgentSchema.virtual("creator", {
    ref: "User",
    localField: "creatorId",
    foreignField: "id",
    justOne: true,
});


userAgentSchema.virtual("entities", {
    ref: "Entity",
    localField: "entityIds",
    foreignField: "id",
});

userAgentSchema.pre("deleteMany", async function (next) {
  const filter = this.getFilter();
  const agentList = await this.model.find(filter);
  const assistantsToBeDeleted = [];

  // Delete all assistants from openAI
  for (const agent of agentList) {
    const assistantId = agent.assistant.id;
    assistantsToBeDeleted.push(openAIAssistantsDel(assistantId));
  }
  await Promise.all(assistantsToBeDeleted);
  next();
});

const UserAgentModel = mongoose.model<IUserAgentDocument>(
    "UserAgent",
    userAgentSchema
);

export default UserAgentModel;
