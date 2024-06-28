import { Job } from "agenda";
import {
    arrangeNewsURLScrapedData,
    arrangeRedditURLScrapedData,
    findOneAndUpdateEntityDocument,
    findOneEntity,
    formatLinkedScrapedData,
    formatNewsURLScrapedData,
    getAllDoubleStepEntity,
    getAllDoubleStepScheduledEntities,
    insertManyEntities,
    processBubblemapsUrlEntities,
    processGitbookUrlEntities,
    processGithubUrlEntities,
    processGoogleNewsURLEntities,
    processTwitterThreadEntities,
    updateManyEntities,
} from "../services/entity.services";
import {
    IProcessDoubleStepEntities,
    IProcessMultipleEntities,
    IRunApifyActorAgenda,
    IRunUserProcess,
    IScheduleContentPost,
    IScheduleRecurringUserProcess,
} from "../types/agenda";
import {
    APIFY_ACTOR_ID,
    generateInputForApifyActor,
    isDoubleStepApifyProcess,
    runApifyActorAndGetResults,
    getTextContent,
    ActorResponse,
    getEntitiesFromScrapedData,
    CategorizedEntityMap,
} from "../services/apify.services";
import { IEntity } from "../models/entity.model";
import {
    PROCESS_DOUBLE_STEP_ENTITIES,
    PROCESS_MULTIPLE_ENTITIES,
    RUN_APIFY_ACTOR_AND_GET_DATA_AGENDA,
    agenda,
    agendaEvery,
} from "./agenda.services";
import {
    getScrapedDataByEntity,
    saveScrapedDataToMongoDB,
} from "../services/scrap.services";
import { createUserVector, findOneUserVector } from "../services/userVector.services";
import { findUserKnowledge, getUserKnowledgeByEntityId } from "../services/userKnowledge.services";
import { createAndUpsertPineconeVectorViaApify } from "../services/pinecone.services";
import { findOneAndUpdateDashboardSummary, getTitleForDashboardSummary } from "../services/dashboardsummary.services";
import { IDashboardSummary } from "../models/dashboardsummary.model";
import { findOneArtemisQueryParam } from "../services/artemis/artemisQueryParam.services";
import { AssetValue } from "../types/artemis.types";
import { findArtemisMetrics } from "../services/artemis/artemisMetric.services";
import {
    fetchArtemisAssetMetric,
    fetchArtemisLendingData,
    fetchArtemisPerpetualsData,
    fetchDateNotSupportedArtemisTerminalData,
    fetchDateSupportedArtemisTerminalData,
} from "../services/artemis";
import { findOneArtemisDropdownDocument } from "../services/artemis/artemisDropdown.services";
import {
    storeArtemisLendingData,
    storeArtemisPerpetualsData,
    storeDateNotSupportedArtemisTerminalData,
    storeDateSupportedArtemisTerminalData,
} from "../services/artemis/artemisData.services";
import { findArtemisPromptDocuments } from "../services/artemis/artemisPrompt.services";
import {
    openAICreateChatCompletion,
} from "../services/openAI.services";
import { insertManyArtemisInsights } from "../services/artemis/artemisInsight.services";
import {
    embedUpsertAndCreateUserVectorFromDocRecord,
    findOneDocRecord,
} from "../services/docRecord.services";
import { findOneAndUpdateUserUsageStatDocument, findOneUserUsageStatDocument } from "../services/userUsageStat.services";
import {
    findOneUserSubscription,
    findUserSubscription,
} from "../services/stripe/userSubscription.service";
import {
    FREE_PLAN_IDENTIFIER,
    findOneSubscriptionPlan,
} from "../services/stripe/subscriptionPlan.service";
import {
    stripeSubscriptionsRetrieve,
    stripeSubscriptionsUpdate,
} from "./stripe";
import { createOneUserUsageHistoryDocument } from "../services/userUsageHistory.services";
import mongoose from "mongoose";
import { deleteManyAgendaJobHistory } from "../services/agenda/agendaJobHistory.services";
import { encode } from "gpt-3-encoder";
import { saveOpenAIFileIdIntoEntity } from "../services/knowlee-agent/agent.services";
import { findOneTwitterConfig } from "../services/twitterConfig.services";
import { createTweet } from "./twitter.services";
// import { findOneMediumConfig } from "../services/mediumConfig.services";
import { publishMediumArticle } from "./medium.services";
import {
    countUserProcesses,
    processUserDefinedProcess,
} from "../services/knowlee-process/userProcess.services";
import { findUser } from "../services/user.services";
import { brevoGetContact, brevoUpdateContact } from "../services/brevo.service";
import { ISubscriptionFeature } from "../models/subscriptionFeature.model";
import { getSingleAndDoubleEntityCount } from "../middleware/subscription";
import { findOneUserReferral } from "../services/userReferral.services";

export async function multipleEntitiesProcessor(
    job: Job<IProcessMultipleEntities>
) {
    const { entities, userIdList } = job.attrs.data;

    if (!userIdList.length) {
        throw new Error("userIdList is empty");
    }

    const sourceTypeEntityMap: CategorizedEntityMap = {
        youtube: {
            account: [],
            video: [],
        },
        twitter: {
            tweet: [],
            thread: [],
            profile: [],
            hashtag: [],
        },
        medium: {
            article: [],
            account: [],
        },
        news: {
            keyword: [],
            url: [],
        },
        url: {
            url: [],
        },
        coda: {
            url: [],
        },
        pdf: {
            url: [],
        },
        reddit: {
            url: [],
        },
        openai: {
            url: [],
        },
        linkedin: {
            url: [],
        },
    };

    // google news is handled seperatly
    const googleNewsEntityList: IEntity[] = [];

    // twitter-thread will be processed single at a time
    const twitterThreadEntityList: IEntity[] = [];

    // gitbook url will be processed single at a time
    const gitbookUrlEntityList: IEntity[] = [];

    // github url will be processed single at a time
    const githubUrlEntityList: IEntity[] = [];

    // bubblemaps url will be processed single at a time
    const bubblemapsUrlEntityList: IEntity[] = [];

    // create mapping for sourceType -> subSetType -> entityList
    for (const entity of entities) {
        const { sourceType, subSetType, isScraped, value } = entity;


        // skip already scraped entity
        if (isScraped) {
            continue;
        }

        // using different actor for google news
        if (
            sourceType === "news" &&
            subSetType === "url" &&
            value.includes("news.google.com")
        ) {
            googleNewsEntityList.push(entity);
            continue;
        }

        // twitter-thread
        if (
            sourceType === "twitter" &&
            subSetType === "thread"
        ) {
            twitterThreadEntityList.push(entity);
            continue;
        }

        //gitbook url
        if(
            sourceType === "gitbook" && 
            subSetType === "url"
        ){
            gitbookUrlEntityList.push(entity);
            continue;
        }

        //github url
        if(
            sourceType === "github" && 
            subSetType === "url"
        ){
            githubUrlEntityList.push(entity);
            continue;
        }
       
        //bubblemaps url
        if(
            sourceType === "bubblemaps"
        ){
            bubblemapsUrlEntityList.push(entity);
            continue;
        }
        sourceTypeEntityMap[sourceType][subSetType].push(entity);
    }

    // process google news entities
    await processGoogleNewsURLEntities(googleNewsEntityList, userIdList);

    // process twitter-thread entities
    await processTwitterThreadEntities(twitterThreadEntityList, userIdList);

    // process gitbook url entities
    await processGitbookUrlEntities(gitbookUrlEntityList, userIdList);
   
    // process github url entities
    await processGithubUrlEntities(githubUrlEntityList, userIdList);

    // process bubblemaps url entities
    await processBubblemapsUrlEntities(bubblemapsUrlEntityList, userIdList);

    for (const sourceType in sourceTypeEntityMap) {
        const subSetTypeEntityMap = sourceTypeEntityMap[sourceType];

        for (const subSetType in subSetTypeEntityMap) {
            const actorId = APIFY_ACTOR_ID[sourceType][subSetType];
            if (!actorId) {
                throw new Error(
                    `There is no actor ID for ${sourceType} - ${subSetType}`
                );
            }

            const entityList = subSetTypeEntityMap[subSetType];
            if (!entityList.length) continue;
            const entityIdList = entityList.map((e) => e.id);

            const isDoubleStep = isDoubleStepApifyProcess({ sourceType, subSetType });
            if (isDoubleStep) {
                await agenda
                    .create<IProcessDoubleStepEntities>(
                        PROCESS_DOUBLE_STEP_ENTITIES,
                        { entities: entities }
                    )
                    .run();
                continue;
            }
            const actorInput = generateInputForApifyActor(actorId, entityList);

            const fetchedActorJob = await agenda.create<IRunApifyActorAgenda>(
                RUN_APIFY_ACTOR_AND_GET_DATA_AGENDA,
                { id: actorId, input: actorInput }
            ).run();
            // asuming actor returns data in same order of input

            const scrapDataApifyResponse = fetchedActorJob.attrs
                .result as ActorResponse;
            let scrapedData = scrapDataApifyResponse?.items;

            //CONDITION FOR NO DATA ENTRY TO FILL UP THE SCRAPED DATA

            // update the field "isScraped" to true
            await updateManyEntities(
                { id: { $in: entityIdList } },
                {
                    isScraped: true, isNoData: !scrapedData.length || scrapedData[0].failedToExtract    //For url which are apify scrapped successfully but no data found
                } 
            );

            if (!scrapedData.length) {
                console.error(
                    `Error: Empty scraped data from Apify actor run response.
                     actorId - ${actorId}, entityIds - ${entityIdList?.join(",")}`
                );
                continue;
            }
            //console.log("scrapedData length----->", scrapedData.length);

            // format scraped data
            if (sourceType === "news" && subSetType === "url") {
                scrapedData = formatNewsURLScrapedData(actorId, scrapedData);
                // arrange scraped data in order of entityList
                scrapedData = arrangeNewsURLScrapedData(entityList, scrapedData);
            }

            if (sourceType === "linkedin" && subSetType === "url") {
                scrapedData = formatLinkedScrapedData(scrapedData, {
                    url: entityList?.[0]?.value,
                });
            }

            if(sourceType === "reddit" && subSetType === "url") {
                // including comments into the post itself
                scrapedData = arrangeRedditURLScrapedData(scrapedData)
            } 

            // add entity ID to scraped data
            scrapedData = scrapedData.map((data, index) => ({
                ...data,
                entityId: entityIdList[index],
            }));

            // count token and save it to entity
            for (const data of scrapedData) {
                const tokens = encode(JSON.stringify(data))?.length ?? 0;
                await findOneAndUpdateEntityDocument(
                    { id: data?.entityId },
                    { $set: { tokens: tokens } }
                );
            }

          // save scraped data to mongoDB in appropriate collection
            const scrapedDataMongoDBRecords = await saveScrapedDataToMongoDB(
                { sourceType, subSetType },
                scrapedData
            );

            const scrapedEntityData = scrapedDataMongoDBRecords[0];
            if (!scrapedEntityData) {
                console.error("No scraped Entity Data found");
                continue;
            }

            // Generating fileIds for entities with scrapped data
            await saveOpenAIFileIdIntoEntity(scrapedDataMongoDBRecords)

            // for (const [
            //     index,
            //     scrapedEntityData,
            // ] of scrapedDataMongoDBRecords.entries()) {
            //     const text = getTextContent(actorId, scrapedEntityData);
            //     if (!text) {
            //         throw new Error(
            //             `No text content found for Agenda in source actorId="${actorId}"`
            //         );
            //     }
            //     //console.log("text----->", text.trim().slice(0, 100));

                // for (const userId of userIdList) {
                    // run Embedding + Upserting Apify actor
                    // const vectorApifyResponse = await createAndUpsertPineconeVectorViaApify({
                    //     namespace: userId,
                    //     text: text,
                    // });

                    // increment totalEmbeddingTokenUsed
                    // const embeddingTokenUsed = vectorApifyResponse?.items?.reduce(
                    //     (tokenCount, item) => {
                    //         return tokenCount + (item?.token_count || 0);
                    //     },
                    //     0
                    // );
                    // consts

                    // const vectorsId = vectorApifyResponse?.items;
                    // //console.log("vectorsId----->", vectorsId);

                    // store data in userVector collection of mongoDB
                    // order remains same for entity and scraped data therefor entityId = entityIdList[index]
                    // const userVector = await createUserVector({
                    //     userId: userId,
                    //     entityId: scrapedEntityData?.entityId || "",
                    //     vectorsId: vectorsId,
                    // });
                    // //console.log("userVector----->", userVector);
                // }
            // }
        }
    }
    //console.log("Done----->multipleEntitiesProcessor");
}

export async function doubleStepEntitiesProcessor(
    job: Job<IProcessDoubleStepEntities>
) {
    const { entities = [] } = job.attrs.data;
    let doubleStepEntities = entities;
    if (!entities.length) {
        doubleStepEntities = await getAllDoubleStepScheduledEntities();
    }
    if (!doubleStepEntities.length) {
        //console.log("No double step entities found");
        return;
    }

    // // For multiple-urls in one actor run
    // const sourceTypeEntityMap : CategorizedEntityMap = {
    //     youtube: {
    //         account: [],
    //     },
    //     twitter: {
    //         profile: [],
    //         hashtag: [],
    //     },
    //     medium: {
    //         account: [],
    //     },
    //     news: {
    //         keyword: [],
    //     },
    // };

    // // create mapping for sourceType -> subSetType -> entityList
    // for (const entity of doubleStepEntities) {
    //     const { sourceType, subSetType } = entity;
    //     sourceTypeEntityMap[sourceType][subSetType].push(entity);
    // }

    // for (const sourceType in sourceTypeEntityMap) {
    //     const subSetTypeEntityMap = sourceTypeEntityMap[sourceType];

    //     for (const subSetType in subSetTypeEntityMap) {
    //         const actorId = APIFY_ACTOR_ID[sourceType][subSetType];
    //         if (!actorId) {
    //             throw new Error(
    //                 `There is no actor ID for ${sourceType} - ${subSetType}`
    //             );
    //         }

    //         const entityList = subSetTypeEntityMap[subSetType];
    //         if (!entityList.length) continue;
    //         const entityIdList = entityList.map((e) => e.id);

    //         const actorInput = generateInputForApifyActor(actorId, entityList);

    //         const fetchedActorJob = await agenda.create<IRunApifyActorAgenda>(
    //             RUN_APIFY_ACTOR_AND_GET_DATA_AGENDA,
    //             { id: actorId, input: actorInput }
    //         ).run();
    //         // asuming actor returns data in same order of input

    //         const scrapDataApifyResponse = fetchedActorJob.attrs
    //             .result as ActorResponse;
    //         const scrapedData = scrapDataApifyResponse?.items;

    //         if (!scrapedData.length) {
    //             //console.log("List of scraped data is empty", scrapedData);
    //             continue;
    //         }

    //         //console.log("----->", actorInput);
    //         //console.log("----->", scrapedData);
    //         // // create new entities based on data received from scrapper
    //         // const entityList = [];
    //     }
    // }

    for (const entity of doubleStepEntities) {
        const { sourceType, subSetType, id: entityId } = entity;
        const actorId = APIFY_ACTOR_ID[sourceType][subSetType];
        if (!actorId) {
            throw new Error(
                `There is no actor ID for ${sourceType} - ${subSetType}`
            );
        }

        const userKnowledgeList = await getUserKnowledgeByEntityId(entityId);
        if (!userKnowledgeList.length) {
            //console.log(`No userKnowledge found for entity - ${entityId}`);
            continue;
        }
        const userIdList = userKnowledgeList.map((doc) => doc.userId);
        //console.log("userIdList----->", userIdList);

        const actorInput = generateInputForApifyActor(actorId, entity);

        const fetchedActorJob = await agenda.create<IRunApifyActorAgenda>(
            RUN_APIFY_ACTOR_AND_GET_DATA_AGENDA,
            { id: actorId, input: actorInput }
        ).run();

        const scrapDataApifyResponse = fetchedActorJob.attrs
            .result as ActorResponse;
        const scrapedData = scrapDataApifyResponse?.items;

        if (!scrapedData.length) {
            //console.log("List of scraped data is empty", scrapedData);
            continue;
        }
        // create new entities based on data received from scrapper
        const entityList = getEntitiesFromScrapedData(actorId, entityId, scrapedData);

        // check if entity is already added by single-step
        const entitiesToInsert: unknown[] = [];

        for (const entity of entityList) {
            const { sourceType, subSetType, value } = entity;
            // find for same entity
            const entityFound = await findOneEntity({
                sourceType: sourceType,
                subSetType: subSetType,
                value: value,
            });
            if (entityFound) {
                //console.log("Entity found", entityFound);
                continue;
            }
            entitiesToInsert.push(entity);

            // for news-keyword, process only 5 urls(entity)
            if (
                actorId === APIFY_ACTOR_ID.news.keyword &&
                entitiesToInsert.length >= 5
            ) {
                break;
            }
        }

        // insert Entities
        const entities = await insertManyEntities(entitiesToInsert);
        //console.log("entities", entities);

        await agenda.create<IProcessMultipleEntities>(
            PROCESS_MULTIPLE_ENTITIES,
            { entities: entities, userIdList: userIdList }
        ).run();

    }
    //console.log("Done----->double Step Entities Processor");
}

export async function runApifyActorAndGetResultsProcessor(
    job: Job<IRunApifyActorAgenda>
) {
    const { id, input } = job.attrs.data;
    return await runApifyActorAndGetResults(id, input);
}


export async function createDashboardSummaryProcessor() {
    // get all userKnowledges
    const userKnowledgeList = await findUserKnowledge({});

    const userDashboardSummaryList: IDashboardSummary[] = [];

    // get latest 5 entities
    for (const userKnowledge of userKnowledgeList) {
        const { userId, entities } = userKnowledge;
        const summaryList = [];
        // reverse to get last added entity first
        const entityIdList = entities.reverse();
        for (const entityId of entityIdList) {
            const entity = await findOneEntity({ id: entityId });
            if (!entity) continue;
            const { sourceType, subSetType, value } = entity;
            if (
                (sourceType === "medium" && subSetType === "article") ||
                (sourceType === "news" && subSetType === "url") ||
                (sourceType === "youtube" && subSetType === "video")
            ) {
                const title = await getTitleForDashboardSummary(entity);
                if (!title) continue;
                summaryList.push({
                    title: title,
                    sourceType: sourceType,
                    entityId: entityId,
                    imageUrl: "",
                    url: value,
                });

                // maximum 5 summaries
                if (summaryList.length >= 5) break;
            } else {
                continue;
            }
        }

        if (!summaryList.length) continue;

        const dashboardsummary = await findOneAndUpdateDashboardSummary(
            { userId: userId },
            { $set: { news: summaryList } },
            { upsert: true, new: true }
        );
        if (dashboardsummary) {
            userDashboardSummaryList.push(dashboardsummary);
        }
    }
    return userDashboardSummaryList;
}

export async function getArtemisAssetMetricProcessor() {

    // get all assets
    // const assetDocument = await findOneArtemisQueryParam({ type: "asset" });
    const assetDocument = await findOneArtemisDropdownDocument({ type: "asset" });
    if (!assetDocument) {
        throw new Error("artemis supported assets not found");
    }

    const supportedAssetNameList = (assetDocument.values as AssetValue[])?.map((v) => v.assetName);

    // get all metrics
    const artemisMetrics = await findArtemisMetrics({});

    const newArtemisDataList = [];
    // for each matrics and each asset call artemis API
    for (const metricDocument of artemisMetrics) {
        for (const assetName of supportedAssetNameList) {
            // const assetName = "zora,aptos";
            // const metricDocument = {
            //     _id: {
            //         $oid: "65490fb18457f16807ab3887",
            //     },
            //     metric: "PRICE",
            //     description: "Token price",
            //     updateFrequency: "5 min",
            //     supportsDate: true,
            // };
            const response = await fetchArtemisAssetMetric(assetName, metricDocument);
            const data = response.data;
            //console.log("data----->", data);
        }
    }


    // store API response in collection named artemisdata
    // get prompt from artemisprompts collection.
    // call openAI with prompt and data
    // store openAI response in artemisinsights collection.
}

export async function fetchArtemisDataEndpointProcessor() {
    const dateSupportedArtemisTerminalData =
        await fetchDateSupportedArtemisTerminalData();
    const dateSupportedArtemisTerminalRecords =
        await storeDateSupportedArtemisTerminalData(
            dateSupportedArtemisTerminalData.artemis_ids
        );

    const dateNotSupportedArtemisTerminalData =
        await fetchDateNotSupportedArtemisTerminalData();
    const dateNotSupportedArtemisTerminalRecords =
        await storeDateNotSupportedArtemisTerminalData(
            dateNotSupportedArtemisTerminalData.artemis_ids
        );

    const artemisPerpetualsData = await fetchArtemisPerpetualsData();
    const artemisPerpetualsRecords = await storeArtemisPerpetualsData(
        artemisPerpetualsData.artemis_ids
    );

    const artemisLendingData = await fetchArtemisLendingData();
    const artemisLendingRecords = await storeArtemisLendingData(
        artemisLendingData.artemis_ids
    );

    const allArtemisDataRecords = [
        ...dateSupportedArtemisTerminalRecords,
        ...dateNotSupportedArtemisTerminalRecords,
        ...artemisPerpetualsRecords,
        ...artemisLendingRecords,
    ];

    // fetching all prompts at a time, in single database call
    const artemisPromptDocuments = await findArtemisPromptDocuments({});

    function getPromptOfMetric(metric: string) {
        const promptDocFound = artemisPromptDocuments.find((promptDoc) => {
            return promptDoc.metric === metric;
        });
        return promptDocFound?.prompt;
    }

    const newArtemisInsights = [];

    // call openAI with prompt and data
    for (const artemisData of allArtemisDataRecords) {
        const { metric, artemisId, data } = artemisData;
        const metricPrompt = getPromptOfMetric(metric);
        if (!metricPrompt) {
            console.error(`No metric Prompt Found for ${metric}`);
            continue;
        }

        // get insight from OpenAI
        const completion = await openAICreateChatCompletion({
            messages: [
                {
                    role: "system",
                    content: `${metricPrompt} ${artemisId}`,
                },
                {
                    role: "user",
                    content: JSON.stringify(data),
                },
            ],
        });
        // //console.log("token usage----->", completion.usage);

        const gptInsight = completion.choices[0]?.message?.content;
        if (!gptInsight) {
            console.error("No data in OpenAI response");
            continue;
        }

        newArtemisInsights.push({
            artemisId: artemisId,
            metric: metric,
            insight: gptInsight,
        });
    }

    // store openAI response in artemisinsights collection.
    await insertManyArtemisInsights(newArtemisInsights);
    return newArtemisInsights;
}

export async function fixScrapingAndUpsertingProcessor() {
    // get all userknowledges
    const userKnowledgeList = await findUserKnowledge({});

    // for each userKnowledge
    for (const userKnowledge of userKnowledgeList) {
        const { entities, userId } = userKnowledge;
        // for each entityId in the entities array
        for (const entityId of entities) {
            // find userVector with userId and entityId
            const userVector = await findOneUserVector({
                userId: userId,
                entityId: entityId,
            });
            // if userVector found continue(skip)
            if (userVector) {
                continue;
            }

            // get entity document
            const entity = await findOneEntity({ id: entityId });

            if (!entity) {
                // it can be a local entity
                const docRecord = await findOneDocRecord({ entityId: entityId });

                if (!docRecord) {
                    console.error(
                        `No entity or docRecord found with entityId: ${entityId}`
                    );
                    // remove entityId from userKnowledge
                    userKnowledge.$set(
                        "entities",
                        userKnowledge.entities.filter((eId) => eId !== entityId)
                    );
                    await userKnowledge.save();
                    continue;
                }

                await embedUpsertAndCreateUserVectorFromDocRecord(docRecord, userId);
                continue;
            }

            const { sourceType, subSetType, value } = entity;

            // if isDoubleStep entity continue(skip)
            const isDoubleStep = isDoubleStepApifyProcess({ sourceType, subSetType });
            if (isDoubleStep) {
                continue;
            }

            // using different actor for google news
            if (
                sourceType === "news" &&
                subSetType === "url" &&
                value.includes("news.google.com")
            ) {
                await processGoogleNewsURLEntities([entity], [userId]);
                continue;
            }

            // process twitter-thread entities
            if (sourceType === "twitter" && subSetType === "thread") {
                await processTwitterThreadEntities([entity], [userId]);
                continue;
            }

            let scrapedEntityData = await getScrapedDataByEntity(entity);

            const actorId = APIFY_ACTOR_ID[sourceType][subSetType];
            if (!scrapedEntityData) {
                if (!actorId) {
                    console.error(
                        `There is no actor ID for ${sourceType} - ${subSetType}`
                    );
                    continue;
                }
                const actorInput = generateInputForApifyActor(actorId, [entity]);
                const fetchedActorJob = await agenda
                    .create<IRunApifyActorAgenda>(RUN_APIFY_ACTOR_AND_GET_DATA_AGENDA, {
                        id: actorId,
                        input: actorInput,
                    })
                    .run();
                // asuming actor returns data in same order of input

                const scrapDataApifyResponse = fetchedActorJob.attrs
                    .result as ActorResponse;
                let scrapedData = scrapDataApifyResponse?.items;

                // update the field "isScraped" to true
                await updateManyEntities(
                    { id: { $in: [entityId] } },
                    { isScraped: true, isNoData:  !scrapedData.length }
                );

                if (!scrapedData.length) {
                    console.error("Empty scraped Data found from Apify actor");
                    continue;
                }

                // format scraped data
                if (sourceType === "news" && subSetType === "url") {
                    scrapedData = formatNewsURLScrapedData(actorId, scrapedData);
                }

                // add entity ID to scraped data
                scrapedData = scrapedData.map((data) => ({
                    ...data,
                    entityId: entityId,
                }));

                // save scraped data to mongoDB in appropriate collection
                const scrapedDataMongoDBRecords = await saveScrapedDataToMongoDB(
                    { sourceType, subSetType },
                    scrapedData
                );

                scrapedEntityData = scrapedDataMongoDBRecords[0];
                if (!scrapedEntityData) {
                    console.error("No scraped Entity Data found");
                    continue;
                }
            }
            // const text = getTextContent(actorId, scrapedEntityData);
            // if (!text) {
            //     console.error(`No text content found`);
            //     continue;
            // }
            // //console.log("Text sample ----->", text.trim().slice(0, 100));

            // run Embedding + Upserting Apify actor
            // const vectorApifyResponse = await createAndUpsertPineconeVectorViaApify({
            //     namespace: userId,
            //     text: text,
            // });

            // increment totalEmbeddingTokenUsed
            // const embeddingTokenUsed = vectorApifyResponse?.items?.reduce(
            //     (tokenCount, item) => {
            //         return tokenCount + (item?.token_count || 0);
            //     },
            //     0
            // );
            // const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
            //     { userId: userId },
            //     {
            //         $inc: {
            //             totalEmbeddingTokenUsed: embeddingTokenUsed,
            //         },
            //     },
            //     { upsert: true, new: true }
            // );

            // const vectorsId = vectorApifyResponse?.items;
            // //console.log("vectorsId----->", vectorsId);

            // store data in userVector collection of mongoDB
            // const newUserVector = await createUserVector({
            //     userId: userId,
            //     entityId: entityId,
            //     vectorsId: vectorsId,
            // });
            // //console.log("newUserVector----->", newUserVector);
        }
    }
}

export async function fixOnlyUpsertingProcessor() {
    // get all userknowledges
    const userKnowledgeList = await findUserKnowledge({});

    // for each userKnowledge
    for (const userKnowledge of userKnowledgeList) {
        const { entities, userId } = userKnowledge;
        // for each entityId in the entities array
        for (const entityId of entities) {
            // find userVector with userId and entityId
            const userVector = await findOneUserVector({
                userId: userId,
                entityId: entityId,
            });
            // if userVector found continue(skip)
            if (userVector) {
                continue;
            }

            // get entity document
            const entity = await findOneEntity({ id: entityId });

            if (!entity) {
                // it can be a local entity
                const docRecord = await findOneDocRecord({ entityId: entityId });

                if (!docRecord) {
                    // remove entityId from userKnowledge
                    userKnowledge.$set(
                        "entities",
                        userKnowledge.entities.filter((eId) => eId !== entityId)
                    );
                    console.error(
                        `No entity or docRecord found with entityId: ${entityId}`
                    );
                    await userKnowledge.save();
                    continue;
                }

                await embedUpsertAndCreateUserVectorFromDocRecord(docRecord, userId);
                continue;
            }

            const { sourceType, subSetType, value } = entity;

            // if isDoubleStep entity continue(skip)
            const isDoubleStep = isDoubleStepApifyProcess(entity);
            if (isDoubleStep) {
                continue;
            }

            // using different actor for google news
            if (
                sourceType === "news" &&
                subSetType === "url" &&
                value.includes("news.google.com")
            ) {
                await processGoogleNewsURLEntities([entity], [userId]);
                continue;
            }

            // process twitter-thread entities
            if (sourceType === "twitter" && subSetType === "thread") {
                await processTwitterThreadEntities([entity], [userId]);
                continue;
            }

            const scrapedEntityData = await getScrapedDataByEntity(entity);

            if (!scrapedEntityData) {
                console.error(`No scrapedEntityData found`);
                continue;
            }
            const actorId = APIFY_ACTOR_ID[sourceType][subSetType];
            const text = getTextContent(actorId, scrapedEntityData);
            if (!text) {
                console.error(`No text content found for entityId - ${entityId}`);
                continue;
            }
            //console.log("Text sample ----->", text.trim().slice(0, 100));

            // run Embedding + Upserting Apify actor
            const vectorApifyResponse = await createAndUpsertPineconeVectorViaApify({
                namespace: userId,
                text: text,
            });

            // increment totalEmbeddingTokenUsed
            const embeddingTokenUsed = vectorApifyResponse?.items?.reduce(
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

            const vectorsId = vectorApifyResponse?.items;
            //console.log("vectorsId----->", vectorsId);

            // store data in userVector collection of mongoDB
            const newUserVector = await createUserVector({
                userId: userId,
                entityId: entityId,
                vectorsId: vectorsId,
            });
            //console.log("newUserVector----->", newUserVector);
        }
    }
}

export async function resetUserUsageStatAndLogProcessor() {
    const currentDate = new Date();

    const updatedUserUsageStats = [];
    const skippedUserSubscriptions = [];

    // find expired user subscriptions 
    const expiredUserSubscriptions = await findUserSubscription({
        endDate: { $lte: currentDate },
    });

    // get free subscription plan
    const freeSubscriptionPlan = await findOneSubscriptionPlan(FREE_PLAN_IDENTIFIER);
    if (!freeSubscriptionPlan || !freeSubscriptionPlan?.subscriptionFeature) {
        console.error("Free Subscription plan not found");
        return { error: "Free Subscription plan not found" };
    }

    for (const userSubscription of expiredUserSubscriptions) {
        try {
        const {
            endDate,
            userId,
            startDate,
            stripeCustomerId,
            stripeSubscriptionId,
            stripePriceId: oldStripePriceId,
        } = userSubscription;

        const stripeSubscription = await stripeSubscriptionsRetrieve(stripeSubscriptionId);

        if (!stripeSubscription) continue;

        // update subscription to free plan
        const upgradeSub = await stripeSubscriptionsUpdate(
            stripeSubscriptionId,
            {
                cancel_at_period_end: false,
                trial_end: "now",
                proration_behavior: "always_invoice",
                items: [
                    {
                        id: stripeSubscription?.items?.data[0]?.id,
                        price: freeSubscriptionPlan.stripePriceId,
                    },
                ],
            }
        );

        // find user usage stat
        let userUsageStat = await findOneUserUsageStatDocument(
            { userId: userId },
        );

        if (!userUsageStat) {
            continue;
        }

        // store log in UserUsageHistory
        await createOneUserUsageHistoryDocument({
            ...(userUsageStat.toJSON() || {}),
            _id: new mongoose.mongo.ObjectId(),
            startDate: startDate,
            endDate: endDate,
            stripeCustomerId: stripeCustomerId,
            stripePriceId: oldStripePriceId,
            stripeSubscriptionId: stripeSubscriptionId,
        })

        // update userSubscription
        userSubscription.plan = freeSubscriptionPlan.subscriptionFeature;
        userSubscription.stripePriceId = upgradeSub?.items?.data?.[0]?.price?.id;
        userSubscription.stripeCurrentPeriodEnd = new Date(
            upgradeSub.current_period_end * 1000
        );
        userSubscription.endDate = new Date(upgradeSub.current_period_end * 1000);
        userSubscription.startDate = new Date(upgradeSub.current_period_start * 1000);
        await userSubscription.save();

        // reset user usage stat
        userUsageStat = await findOneAndUpdateUserUsageStatDocument(
            { userId: userId },
            {
                // decrease credit used from total credit
                $inc: {
                    "credit.total": (0 - userUsageStat?.credit?.used),
                },
                $set: {
                    tokenUsed: 0,
                    imageInterpretationCount: 0,
                    speechToTextCount: 0,
                    textToAudioCount: 0,
                    "textToImage.dalle3Count": 0,
                    "textToImage.sdxlCount": 0,
                    textToVideoCount: 0,
                    userProcessCount: 0,
                    userThreadCount: 0,
                    totalEmbeddingTokenUsed: 0,
                    "credit.used": 0,
                    totalRunTokenUsed: 0,
                },
            },
            { upsert: true, new: true }
        );
        updatedUserUsageStats.push(userUsageStat);
        } catch (error) {
            skippedUserSubscriptions.push(userSubscription);
            // console.log("resetUserUsageStatAndLogProcessor Error----->", error);
        }
    }
    return { updatedUserUsageStats, skippedUserSubscriptions };
}

export async function deleteOldAgendaJobHistoryProcessor() {
    // two months ago
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    return await deleteManyAgendaJobHistory({ createdAt: { $lt: twoMonthsAgo } })
}

export async function scheduleContentPostProcessor(
    job: Job<IScheduleContentPost>
) {
    const { content } = job.attrs.data;
    // console.log("content----->", content);
    const { contentData, contentFormat, contentTitle, userId } = content;

    switch (contentFormat) {
        case "thread":
        case "tweet": {
            // handle create tweet
            const twitterConfig = await findOneTwitterConfig({
                userId: userId,
            });
            if (!twitterConfig) {
                throw new Error("Twitter config not found");
            }
            const tweet = await createTweet(twitterConfig.token, {
                userId: userId,
                text: contentData,
            });
            return tweet;
        }

        case "article": {
            // handle medium article
            // const mediumConfig = await findOneMediumConfig({
            //     userId: userId,
            // });
            // if (!mediumConfig) {
            //     throw new Error("Medium config not found");
            // }
            const res = await publishMediumArticle({
                content: contentData,
                tags: ["AI", "GPT", "AI Assistants"],
                title: contentTitle,
            });
            return res;
        }

        default:
            return "Success";
    }
}

export async function runUserProcessProcessor(job: Job<IRunUserProcess>) {
    const { userProcessId } = job.attrs.data;
    const threadId = await processUserDefinedProcess({
        userProcessId: userProcessId,
    });
    return {
        threadId,
    };
}

export async function scheduleRecurringUserProcessProcessor(
    job: Job<IScheduleRecurringUserProcess>
) {
    const { interval, jobName, userProcessId } = job.attrs.data;
    //  schedule agenda job to run the user process at every interval hours
    const recurringJob = await agendaEvery(`${interval} hours`, jobName, {
        userProcessId: userProcessId,
    });
    return {
        jobId: recurringJob?.attrs?._id,
    };
}

export async function pushUserStatsToBrevoProcessor() {
    // retrieving all users from the database
    const users = await findUser({});

    for (const user of users) {
        const { email, id: userId } = user;
        // fetching contact information for each user from Brevo
        const contact = await brevoGetContact(email);
        if (!contact) {
            console.log(
                `Brevo contact not found for userId ${userId} email(${email})`
            );
            continue;
        }

        const attributes = {
            ...(contact?.body?.attributes || {}),
        };

        // collecting user statistics

        // find user usage stat
        const userUsageStat = await findOneUserUsageStatDocument(
            { userId: userId },
            {},
            { lean: true }
        );

        if (!userUsageStat) {
            console.log(`userUsageStat not found for userId ${userId}`);
            continue;
        }

        // Subscription Type name of the subscription push to SUBSCRIPTION
        const currentDate = new Date();
        const activeUserSubscription = await findOneUserSubscription(
            {
                userId: userId,
                startDate: { $lte: currentDate },
                endDate: { $gte: currentDate },
            },
            {},
            { populate: { path: "plan", model: "SubscriptionFeature" } }
        );
        const SUBSCRIPTION =
            (activeUserSubscription?.plan as ISubscriptionFeature)?.name ||
            FREE_PLAN_IDENTIFIER.name;
        attributes.SUBSCRIPTION = SUBSCRIPTION;

        // Number of Assistant created {userStats?.userAgentCount} push to AGENTCOUNT
        const AGENTCOUNT = userUsageStat?.userAgentCount || 0;
        attributes.AGENTCOUNT = AGENTCOUNT;

        // Number of Processes created number of docs in collection userprocesses with creatorId=userId push to PROCESSCOUNT
        const PROCESSCOUNT = await countUserProcesses({ creatorId: userId });
        attributes.PROCESSCOUNT = PROCESSCOUNT;

        // Number of Sources created {singleStepEntityCount + doubleStepEntityCount} push to SOURCESCOUNT
        const {
            doubleStepCount: doubleStepEntityCount,
            singleStepCount: singleStepEntityCount,
        } = getSingleAndDoubleEntityCount(userUsageStat?.entityCount);
        attributes.SOURCESCOUNT = singleStepEntityCount + doubleStepEntityCount;

        // Number of user referred number of elements in array userreferrals.invitedEmails push to REFERRALCOUNT
        const userReferral = await findOneUserReferral({ userId: userId });
        const REFERRALCOUNT = userReferral?.invitedEmails?.length || 0;
        attributes.REFERRALCOUNT = REFERRALCOUNT;

        // Number of chats {userStats?.userThreadCount} push to CHATCOUNT
        const CHATCOUNT = userUsageStat?.userThreadCount || 0;
        attributes.CHATCOUNT = CHATCOUNT;

        // updating the contact information on Brevo
        await brevoUpdateContact(email, {
            attributes: attributes,
        });
    }

    return "Done";
}
