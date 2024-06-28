import { FilterQuery, ProjectionType, QueryOptions } from "mongoose";
import {
    DefaultKnowledgeModel,
    IDefaultKnowledge,
} from "../models/defaultKnowledge.model";
import { createAndUpsertPineconeVectorViaApify } from "./pinecone.services";
import { User } from "../models/user.model";
import { findOneAndUpdateUserUsageStatDocument } from "./userUsageStat.services";

export async function findDefaultKnowledge(
    filter: FilterQuery<IDefaultKnowledge>,
    projection?: ProjectionType<IDefaultKnowledge>,
    options?: QueryOptions<IDefaultKnowledge>
) {
    return DefaultKnowledgeModel.find(filter, projection, options);
}

// upsert default knowledge
export async function upsertDefaultKnowledge(user: User) {
    const { id: userId } = user;
    const defaultKnowledgeList = await findDefaultKnowledge({});
    for (const defaultKnowledge of defaultKnowledgeList) {
        const apifyResponse = await createAndUpsertPineconeVectorViaApify({
            namespace: userId,
            text: defaultKnowledge.defaultContent,
        });

        if (!apifyResponse?.items) {
            //console.log("Empty apify response");
            continue;
        }

        // increment totalEmbeddingTokenUsed
        const embeddingTokenUsed = apifyResponse?.items?.reduce(
            (tokenCount, item) => {
                return tokenCount + (item?.token_count || 0);
            },
            0
        );
        const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
            { userId: userId },
            {
                $inc: {
                    totalEmbeddingTokenUsed: embeddingTokenUsed,
                },
            },
            { upsert: true, new: true }
        );
    }
}
