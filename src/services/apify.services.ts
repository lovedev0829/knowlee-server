import { ApifyClient, PaginatedList } from "apify-client";
import { IEntity } from "../models/entity.model";
import { Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { ACTOR_IDS } from "../utils/constants";

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const APIFY_USER_ID = process.env.APIFY_USER_ID;

const { OPENAI_ACTOR_ID } = ACTOR_IDS

export type MediumAccountApifyInput = {
    article_content: boolean,
    author: string,
    limit: number,
}

export type ActorResponse<T = Record<string | number, unknown>> = PaginatedList<T>;

export type CategorizedEntityMap = {
    [key: string]: {
        [key: string]: IEntity[];
    };
};

type ApifyActorId = {
    [key: string]: {
        [key: string]: string;
    };
};

export interface GoogleNewsData {
    text: string;
    url: string;
    metadata: { author: string; title: string };
    [type: string | number]: unknown;
}

export const embeddingUpsertingApifyActorId =
    process.env.DEPLOY_ENV === "production"
        ? "Bl4S9SBJn1diyeRhG"
        : "MbRjb8iv34xl8ebBV";
export const googleNewsApifyActorId = "aYG0l9s7dbB7j3gbS";

export const APIFY_ACTOR_ID: ApifyActorId = {
    youtube: {
        account: "h7sDV53CddomktSi5",
        video: "d5OZNMHGxfIED4xZb",
    },
    twitter: {
        tweet: "KVJr35xjTw2XyvMeK",
        thread: "VsTreSuczsXhhRIqa",
        profile: "VsTreSuczsXhhRIqa",
        hashtag: "VsTreSuczsXhhRIqa",
    },
    medium: {
        article: "MaDZ0kwc28H8KKLJA",
        account: "0LNrHz8WBAlYpRnMA",
    },
    news: {
        keyword: "eWUEW5YpCaCBAa0Zs",
        url: "MaDZ0kwc28H8KKLJA",
    },
    pdf: {
        url: "sOzJ7Qda1HgjnCmO7",
    },
    url: {
        url: "MaDZ0kwc28H8KKLJA",
    },
    coda: {
        url: "aYG0l9s7dbB7j3gbS",
    },
    all: {
        all: "Bl4S9SBJn1diyeRhG",
    },
    reddit: {
        url: "oAuCIx3ItNrs2okjQ",
    },
    openai: {
        url: OPENAI_ACTOR_ID,
    },
    linkedin: {
        url: "gdbRh93zn42kBYDyS",
    },
};

export const doubleStepActors = [
    APIFY_ACTOR_ID.youtube.account,
    APIFY_ACTOR_ID.twitter.hashtag,
    APIFY_ACTOR_ID.twitter.profile,
    APIFY_ACTOR_ID.medium.account,
    APIFY_ACTOR_ID.news.keyword,
];

export function isDoubleStepApifyProcess({
    sourceType,
    subSetType,
}: {
    sourceType: string;
    subSetType: string;
}) {
    switch (sourceType) {
        case "youtube":
            if (subSetType === "account") return true;

        case "twitter":
            if (
                subSetType === "hashtag" ||
                subSetType === "profile"
            )
                return true;

        case "medium":
            if (subSetType === "account") return true;

        case "news":
            if (subSetType === "keyword") return true;

        default:
            return false;
    }
}

export function generateInputForApifyActor(
    id: string,
    entity: IEntity | IEntity[]
) {
    switch (id) {
        case "h7sDV53CddomktSi5":
            return {
                downloadSubtitles: true,
                hasCC: false,
                hasLocation: false,
                hasSubtitles: false,
                is360: false,
                is3D: false,
                is4K: false,
                isBought: false,
                isHD: false,
                isHDR: false,
                isLive: false,
                isVR180: false,
                maxResultStreams: 0,
                maxResults: 10,
                maxResultsShorts: 0,
                preferAutoGeneratedSubtitles: true,
                saveSubsToKVS: false,
                startUrls: Array.isArray(entity)
                    ? entity.map((e) => ({ url: e.value }))
                    : [{ url: entity.value }],
                subtitlesFormat: "plaintext",
            };

        case "d5OZNMHGxfIED4xZb":
            return {
                max_depth: 1,
                start_urls: Array.isArray(entity)
                    ? entity.map((e) => ({ url: e.value }))
                    : [{ url: entity.value }],
            };

        case "KVJr35xjTw2XyvMeK":
            return {
                addUserInfo: false,
                startUrls: Array.isArray(entity)
                    ? entity.map((e) => ({ url: e.value }))
                    : [{ url: entity.value }],
                tweetsDesired: 25,
            };

        case "VsTreSuczsXhhRIqa":
            return {
                includeUserInfo: false,
                profilesDesired: 10,
                since: "30 day",
                startUrls: Array.isArray(entity)
                    ? entity.map((e) => ({ url: e.value }))
                    : [{ url: entity.value }],
                tweetsDesired: 15,
                withReplies: false,
            };

        case "aYG0l9s7dbB7j3gbS":
            return {
                aggressivePrune: false,
                clickElementsCssSelector: '[aria-expanded="false"]',
                debugMode: false,
                proxyConfiguration: {
                    useApifyProxy: true,
                },
                removeCookieWarnings: true,
                removeElementsCssSelector:
                    'nav, footer, script, style, noscript, svg,\n[role="alert"],\n[role="banner"],\n[role="dialog"],\n[role="alertdialog"],\n[role="region"][aria-label*="skip" i],\n[aria-modal="true"]',
                saveFiles: false,
                saveHtml: false,
                saveMarkdown: false,
                saveScreenshots: false,
                startUrls: Array.isArray(entity)
                    ? entity.map((e) => ({ url: e.value }))
                    : [{ url: entity.value }],
            };

        case "0LNrHz8WBAlYpRnMA":
            if (Array.isArray(entity)) {
                throw new Error(
                    `Apify Actor 0LNrHz8WBAlYpRnMA does not accept multiple source(author)`
                );
            }
            return {
                article_content: true,
                author: entity.value,
                limit: 5,
            };

        case "eWUEW5YpCaCBAa0Zs":
            if (Array.isArray(entity)) {
                throw new Error(
                    `Apify Actor eWUEW5YpCaCBAa0Zs does not accept multiple source(query)`
                );
            }
            return {
                extractImages: false,
                language: "US:en",
                maxItems: 3,
                proxyConfiguration: {
                    useApifyProxy: true,
                },
                query: entity.value,
            };

        case "sOzJ7Qda1HgjnCmO7":
            return {
                start_urls: Array.isArray(entity)
                    ? entity.map((e) => ({ url: e.value }))
                    : [{ url: entity.value }],
            };

        // for medium-article, news-url(except google-news), url-url
        case "MaDZ0kwc28H8KKLJA":
            return {
                proxyConfiguration: {
                    useApifyProxy: true,
                },
                saveArticleHtml: false,
                savePageHtml: false,
                startUrls: Array.isArray(entity)
                    ? entity.map((e) => ({ url: e.value }))
                    : [{ url: entity.value }],
            };

        case "oAuCIx3ItNrs2okjQ": 
            return {
                debugMode: false,
                includeNSFW: true,
                maxComments: 10,
                maxCommunitiesCount: 2,
                maxItems: 10,
                maxPostCount: 10,
                maxUserCount: 2,
                proxy: {
                  useApifyProxy: true,
                  apifyProxyGroups: [
                    "GOOGLE_SERP"
                  ]
                },
                scrollTimeout: 40,
                searchComments: false,
                searchCommunities: false,
                searchPosts: true,
                searchUsers: false,
                skipComments: false,
                startUrls: 
                Array.isArray(entity)
                    ? entity.map((e) => ({ url: e.value }))
                : [{ url: entity.value }]
              }
        
        case OPENAI_ACTOR_ID: 
            return {
                aggressivePrune: true,
                clickElementsCssSelector: '[aria-expanded="false"]',
                debugLog: false,
                debugMode: false,
                ignoreCanonicalUrl: false,
                includeUrlGlobs: [
                  {
                    glob: "https://www.producthunt.com/@*",
                  },
                ],
                proxyConfiguration: {
                  useApifyProxy: true,
                },
                removeCookieWarnings: true,
                removeElementsCssSelector:
                  'nav, footer, script, style, noscript, svg,\n[role="alert"],\n[role="banner"],\n[role="dialog"],\n[role="alertdialog"],\n[role="region"][aria-label*="skip" i],\n[aria-modal="true"]',
                saveFiles: false,
                saveHtml: false,
                saveMarkdown: false,
                saveScreenshots: false,
                crawlerType: "playwright:firefox",
                excludeUrlGlobs: [],
                maxCrawlDepth: 20,
                maxCrawlPages: 9999999,
                initialConcurrency: 0,
                maxConcurrency: 200,
                initialCookies: [],
                maxSessionRotations: 10,
                requestTimeoutSecs: 60,
                dynamicContentWaitSecs: 10,
                maxScrollHeightPixels: 5000,
                htmlTransformer: "readableText",
                readableTextCharThreshold: 100,
                maxResults: 9999999,
                startUrls:
                Array.isArray(entity)
                    ? entity.map((e) => ({ url: e.value }))
                : [{ url: entity.value }]
            }

        case APIFY_ACTOR_ID.linkedin.url: {
            return {
                count: 5,
                maxDelay: 5,
                minDelay: 2,
                proxy: {
                    useApifyProxy: true,
                    apifyProxyGroups: ["BUYPROXIES94952"],
                    apifyProxyCountry: "US",
                },
                scrapeCompany: true,
                scrapeJobDetails: false,
                scrapeSkills: false,
                searchUrl: Array.isArray(entity)
                    ? entity?.[0]?.value
                    : entity.value,
                startPage: 1,
            };
              }
        default:
            throw new Error(
                `Input is not defined for apify actor ${id} in generateInputForApifyActor`
            );
    }
}

export function getTextKey(id: string) {
    switch (id) {
        case "d5OZNMHGxfIED4xZb":
            return "transcript";

        case "KVJr35xjTw2XyvMeK":
            return "full_text";

        case "VsTreSuczsXhhRIqa":
            return "text";

        case "aYG0l9s7dbB7j3gbS":
            // do not use this funtion for news-url(google-news)
            return "text";

        case "0LNrHz8WBAlYpRnMA":
            return "raw_article";

        case "sOzJ7Qda1HgjnCmO7":
            return "content";

        // for medium-article, news-url(except google-news), url-url
        case "MaDZ0kwc28H8KKLJA":
            return "content";

        // REDDIT
        case "oAuCIx3ItNrs2okjQ":
            return "body";

        // OPENAI
        case OPENAI_ACTOR_ID:
            return "text";

        default:
            return;
    }
}

export function getTextContent(
    actorId: string,
    scrapedData: Document
): string | undefined {
    const textKey = getTextKey(actorId);
    if (!textKey) {
        console.error(`No textKey found for actor ${actorId} in getTextKey`);
        return;
    }

    switch (actorId) {
        // for pdf-url
        case "sOzJ7Qda1HgjnCmO7":
            const textArray = scrapedData.get(textKey);
            return textArray.join(" ");

        case "d5OZNMHGxfIED4xZb":
        case "KVJr35xjTw2XyvMeK":
        case "VsTreSuczsXhhRIqa":
        case "aYG0l9s7dbB7j3gbS":
        case "0LNrHz8WBAlYpRnMA":
       
        // REDDIT
        case "oAuCIx3ItNrs2okjQ":
        
        // OPENAI
        case OPENAI_ACTOR_ID:


        // for medium-article, news-url(except google-news), url-url
        case "MaDZ0kwc28H8KKLJA":
            return scrapedData.get(textKey, String);

        default:
            return;
    }
}

const apifyClient = new ApifyClient({
    token: APIFY_TOKEN,
});

// Starts an actor and waits for it to finish.
export async function startApifyActor(id: string, input: unknown) {
    // twitter-profile
    if (id === "0LNrHz8WBAlYpRnMA") {
        const { author, article_content, limit } = (input as MediumAccountApifyInput);
        input = {
            article_content,
            author: author.replace("https://medium.com/@", ""),
            limit,
        };
    }
    // return await apifyClient.actor(id).call(input, {
    //     waitSecs: 60,
    // });
    //console.log(`running apify actor ${id} ----->`);
    return await apifyClient.actor(id).call(input);
}

// Fetches results from the actor's dataset.
export async function fetchActorResults(id: string) {
    return await apifyClient.dataset(id).listItems();
}

// Get dataset
export async function getDataset(id: string) {
    return await apifyClient.dataset(id).get();
}

export async function runApifyActorAndGetResults(id: string, input: unknown) {
    const actorRunResult = await startApifyActor(id, input);

    if (actorRunResult.status !== "SUCCEEDED") {
        console.error(actorRunResult);
        throw new Error("Apify actor run not suceeded");
    }

    // fetch results from actor run
    const fetchActorResult = await fetchActorResults(
        actorRunResult.defaultDatasetId
    );
    //console.log(`actor ${id} result----->`, fetchActorResult?.items);

    if (!fetchActorResult?.items?.length) {
        console.error(
            `Error: Empty scraped data from Apify actor run response, actorId - ${id}, runId - ${actorRunResult?.id}`
        );
    }
    return fetchActorResult;
}


export function getEntitiesFromScrapedData(
    actorId: string,
    originId: string,
    data: unknown[] = []
) {
    switch (actorId) {
        // youtube-account
        case "h7sDV53CddomktSi5": {
            const entityList = data.map((video) => {
                return {
                    id: uuidv4(),
                    originId: originId,
                    sourceType: "youtube",
                    subSetType: "video",
                    value: (video as { url: string }).url,
                };
            });
            //console.log("entityList", entityList);
            return entityList;
        }

        // twitter-profile
        // twitter-hashtag
        case "VsTreSuczsXhhRIqa": {
            const entityList = data.map((tweet) => {
                return {
                    id: uuidv4(),
                    originId: originId,
                    sourceType: "twitter",
                    subSetType: "tweet",
                    value: (tweet as { url: string }).url,
                };
            });
            //console.log("entityList", entityList);
            return entityList;
        }

        // medium-account
        case "0LNrHz8WBAlYpRnMA": {
            const entityList = data.map((article) => {
                return {
                    id: uuidv4(),
                    originId: originId,
                    sourceType: "medium",
                    subSetType: "article",
                    value: (article as { url: string }).url,
                };
            });
            //console.log("entityList", entityList);
            return entityList;
        }

        // news-keyword
        case "eWUEW5YpCaCBAa0Zs": {
            const entityList = data.map((news) => {
                return {
                    id: uuidv4(),
                    originId: originId,
                    sourceType: "news",
                    subSetType: "url",
                    value: (news as { link: string }).link,
                };
            });
            //console.log("entityList", entityList);
            return entityList;
        }
       
        // REDDIT
        case "oAuCIx3ItNrs2okjQ": {
            const entityList = data.map((redditPost) => {
                return {
                    id: uuidv4(),
                    originId: originId,
                    sourceType: "news",
                    subSetType: "url",
                    value: (redditPost as { link: string }).link,
                };
            });
            //console.log("entityList", entityList);
            return entityList;
        }
      
        // OPENAI
        case OPENAI_ACTOR_ID: {
            const entityList = data.map((chat) => {
                return {
                    id: uuidv4(),
                    originId: originId,
                    sourceType: "news",
                    subSetType: "url",
                    value: (chat as { link: string }).link,
                };
            });
            //console.log("entityList", entityList);
            return entityList;
        }

        default:
            return [];
    }
}
