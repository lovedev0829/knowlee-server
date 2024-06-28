import {
    PineconeClient,
    Vector,
    UpsertRequest,
} from "@pinecone-database/pinecone";
import { v4 as uuidv4 } from "uuid";

require("dotenv").config();

import { OpenAI } from "langchain/llms/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Delete1Request, VectorOperationsApi } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch";
import { RUN_APIFY_ACTOR_AND_GET_DATA_AGENDA, agenda } from "../lib/agenda.services";
import { IRunApifyActorAgenda } from "../types/agenda";
import { ActorResponse, embeddingUpsertingApifyActorId } from "./apify.services";

const openAIApiKey = process.env.OPENAI_APIKEY as string;
const PineconeAPIKEY = process.env.PINECONE_APIKEY as string;
const pineconeENV = process.env.PINECONE_ENV as string;
const pineconeIndex = process.env.PINECONE_INDEX as string;

// type OpenAIEmbeddings = /*unresolved*/ any;

let pinecone: PineconeClient;
let knowleePineconeIndex: VectorOperationsApi;
let embeddings: OpenAIEmbeddings;

interface UpsertPinconeVectorParams {
    embedText: string
    metadata?: object
    namespace?: string
}

export const initPinecone = async () => {
    pinecone = new PineconeClient();
    await pinecone.init({
        environment: pineconeENV,
        apiKey: PineconeAPIKEY,
    });
    knowleePineconeIndex = pinecone.Index(pineconeIndex);
    embeddings = new OpenAIEmbeddings({ openAIApiKey });
};

export const deletePinconeVector = async (
    requestParameters: Delete1Request
) => {
    const deleteRes = await knowleePineconeIndex.delete1(requestParameters);
    return deleteRes;
};

// store vector to the pinecode db
export const upsertPinconeVector = async ({ embedText, metadata = {}, namespace }: UpsertPinconeVectorParams) => {
    const newVectorId = uuidv4();

    // Embed the query
    const queryEmbedding = await embeddings.embedQuery(embedText);
    const vector: Vector = {
        id: newVectorId,
        values: queryEmbedding,
        metadata: {
            text: embedText,
            ...metadata
        }
    };
    const upsertRequest: UpsertRequest = {
        vectors: [vector],
        namespace: namespace,
    };
    const upsertResponse = await knowleePineconeIndex.upsert({ upsertRequest });
    //console.log("upsertResponse----->", newVectorId, upsertResponse);
    return { vectorId: newVectorId, upsertResponse };
}

export async function createAndUpsertPineconeVectorViaApify({
    namespace,
    text,
}: {
    namespace: string;
    text: string;
    }) {
    const vectorInput = {
        index: pineconeIndex,
        namespace: namespace,
        text: text,
    };
    // job to create vector apify actor run
    const createVectorApifyJob = await agenda
        .create<IRunApifyActorAgenda>(RUN_APIFY_ACTOR_AND_GET_DATA_AGENDA, {
            id: embeddingUpsertingApifyActorId,
            input: vectorInput,
        })
        //.run()
        ;

    return createVectorApifyJob.attrs.result as ActorResponse<{
        id: string;
        token_count: number;
    }>;
}

export const pineconeFetch = async (requestParameters: {
    ids: Array<string>;
    namespace?: string;
}) => {
    return await knowleePineconeIndex.fetch(requestParameters);
};
