import { Document, InferSchemaType, model, Schema, Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { deleteManyQueryQuestion } from "../services/queryQuestion.services";

export interface IConversation extends Document {
  id: string;
  user: Types.ObjectId;
  title: string;
  chatList: Types.ObjectId[];
  createdAt: Date;
  isDeleted: boolean;
  deletedAt: Date;
  updatedAt: Date;

  // Add the softDelete method here
  softDelete(): Promise<IConversation>;
}


const ConversationSchema = new Schema<IConversation>({
  id: {
    type: String,
    default: uuidv4,
    required: true,
    unique: true,
  },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: {
    type: String,
    default: "",
  },
  chatList: {
    type: [{ type: Schema.Types.ObjectId, ref: "QueryQuestion" }],
    default: []
  },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
},
  {
    timestamps: true,
  }
);

ConversationSchema.methods.restore = function () {
  this.isDeleted = false;
  this.deletedAt = null;
  return this.save();
};

ConversationSchema.methods.softDelete = async function (): Promise<IConversation> {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

ConversationSchema.pre("deleteOne", { document: true }, async function (next) {
  // Delete all queryQuestions in chatList
  await deleteManyQueryQuestion({ _id: { $in: this.chatList } });
  next()
})

ConversationSchema.pre("deleteMany", async function (next) {
  const chatIdList: Types.ObjectId[] = [];
  const conversationList = await this.model.find(this.getFilter());
  conversationList.forEach(con => {
    chatIdList.push(...con.chatList);
  })
  // Delete all queryQuestions in chatList
  await deleteManyQueryQuestion({ _id: { $in: chatIdList } });
  next()
})

export type Conversation = InferSchemaType<typeof ConversationSchema>;

export const ConversationModel = model<IConversation>("Conversation", ConversationSchema);
