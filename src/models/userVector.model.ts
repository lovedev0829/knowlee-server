import mongoose, { Schema, Document } from 'mongoose';
import { deletePinconeVector } from '../services/pinecone.services';
import { findOneAndUpdateUserUsageStatDocument } from '../services/userUsageStat.services';

export interface IUserVector extends Document {
    userId: string;
    entityId: string;
    vectorsId: {
        id: string;
        token_count: number;
    }[];
}

const userVectorSchema = new Schema<IUserVector>({
    userId: {
        type: String,
        ref: "User",
        required: true,
    },
    entityId: {
        type: String,
        ref: "Entity",
        required: true,
    },
    vectorsId: {
        type: [
            {
                id: { type: String },
                token_count: { type: Number },
            },
        ],
        default: [],
    },
});

userVectorSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: 'id'
});

userVectorSchema.virtual('entity', {
    ref: 'Entity',
    localField: 'entityId',
    foreignField: 'id'
});

userVectorSchema.pre("deleteOne", { document: true }, function (next) {
    // remove vectors from pinecone
    const ids = this.vectorsId.map(v => v.id);
    deletePinconeVector({ ids: ids, namespace: this.userId });

    // // decrement totalEmbeddingTokenUsed
    // const embeddingTokenUsed = this.vectorsId?.reduce(
    //     (tokenCount, item) => {
    //         return tokenCount - (item?.token_count || 0);
    //     },
    //     0
    // );
    // findOneAndUpdateUserUsageStatDocument(
    //     { userId: this.userId },
    //     {
    //         $inc: {
    //             totalEmbeddingTokenUsed: embeddingTokenUsed,
    //         },
    //     },
    //     { upsert: true, new: true }
    // );
    next();
})

const UserVectorModel = mongoose.model<IUserVector>('UserVector', userVectorSchema);

export default UserVectorModel;
