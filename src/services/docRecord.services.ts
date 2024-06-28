import { FilterQuery, ProjectionType, QueryOptions } from "mongoose";
import { DocRecordModel, IDocRecord } from "../models/docRecord.model";
import { Document as LangchainDocument } from "langchain/document";
import { createAndUpsertPineconeVectorViaApify } from "./pinecone.services";
import { createUserVector } from "./userVector.services";
import { findOneAndUpdateUserUsageStatDocument } from "./userUsageStat.services";

export async function findOneDocRecord(
    filter?: FilterQuery<IDocRecord>,
    projection?: ProjectionType<IDocRecord>,
    options?: QueryOptions<IDocRecord>
) {
    return await DocRecordModel.findOne(filter, projection, options);
};

export async function findDocRecordDocuments(
    filter: FilterQuery<IDocRecord>,
    projection?: ProjectionType<IDocRecord>,
    options?: QueryOptions<IDocRecord>
) {
    return await DocRecordModel.find(filter, projection, options);
}

export async function embedUpsertAndCreateUserVectorFromDocRecord(
    docRecord: IDocRecord,
    userId: string
) {
    // get text content
    const text = (docRecord.content as LangchainDocument<Record<string, any>>[])
        ?.map((item) => item.pageContent)
        .join(" ");

    // Pinecone Embedding + Upserting
    const apifyResponse = await createAndUpsertPineconeVectorViaApify({
        namespace: userId,
        text: text,
    });

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

    // store user vectors
    const vectorsId = apifyResponse?.items;
    const userVector = await createUserVector({
        userId: userId,
        entityId: docRecord.entityId,
        vectorsId: vectorsId,
    });

    return userVector;
}
