import OpenAI from "openai";
import {
    ChatCompletionContentPart,
    ChatCompletionCreateParamsNonStreaming,
    FileCreateParams,
} from "openai/resources";
import { SpeechCreateParams } from "openai/resources/audio/speech";
import { TranscriptionCreateParams } from "openai/resources/audio/transcriptions";
import {
    AssistantCreateParams,
    AssistantListParams,
    AssistantUpdateParams,
} from "openai/resources/beta/assistants";
import {
    MessageCreateParams,
    MessageListParams,
} from "openai/resources/beta/threads/messages";
import {
    Run,
    RunCreateParams,
    RunListParams,
    RunSubmitToolOutputsParams,
} from "openai/resources/beta/threads/runs/runs";
import { Readable } from "stream";
import { availableOpenAIFunctions } from "./openai/functions";
import { User } from "../models/user.model";
import { Thread } from "openai/resources/beta/threads/threads";
import { APIPromise } from "openai/core";
import {
    RunCreateParamsBaseStream,
    RunSubmitToolOutputsParamsStream,
} from "openai/lib/AssistantStream";
import { Request, Response } from "express";
import { FileBatchCreateParams } from "openai/resources/beta/vector-stores/file-batches";
import { FileListParams } from "openai/resources/beta/vector-stores/files";
import { VectorStoreCreateParams } from "openai/resources/beta/vector-stores/vector-stores";
import { findOneAndUpdateUserUsageStatDocument } from "./userUsageStat.services";
import { UpdateQuery } from "mongoose";
import { findOneStatsPriceDocument } from "./stripe/statsPrice.services";
import { IUserUsageStat } from "../models/UserUsageStat.model";
import { OpenAIAssistantStreamEventHandler } from "../lib/openai/openaiEventHandler";

const OPENAI_API_KEY = process.env.OPENAI_APIKEY as string;
export const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

const model = "gpt-4o";
const temperature = 0.8;

// VIDEO TO TEXT - PARAMS
// Please select appropriate value, Kept 400 while testing 
const VIDEO_TO_TEXT_MAX_TOKENS = 4096;
export const VIDEO_TO_TEXT_DEFAULT_FRAMERATE = 1;
export const VIDEO_TO_TEXT_DEFAULT_COMMAND = "These are frames from a video that I want to understand. Provide a well detailed description of the story.";
export const DEFAULT_VOICEOVER_MODEL = "tts-1"
export const DEFAULT_VOICEOVER_VOICE = "alloy"

export const DEFAULT_INSTRUCTION_FOR_SPEECH_TO_SPEECH = `You are a friend. You are having a 
vocal conversation with a user. You will never output any markdown 
or formatted text of any kind, and you will speak in a concise, 
highly conversational manner. You will adopt any persona that the 
user may ask of you.`;
export const DEFAULT_SPEECH_TO_SPEECH_MODEL = "whisper-1"

type CreateChatCompletionBody = Omit<
    ChatCompletionCreateParamsNonStreaming,
    "model" | "temperature"
>;

export async function openAICreateChatCompletion(
    body: CreateChatCompletionBody
) {
    //console.log("Running openai chat completions...");
    const completion = await openai.chat.completions.create({
        ...body,
        temperature: temperature,
        model: model,
    });

    //console.log(completion);
    return completion;
}

export async function openAICreateChatCompletionForVideoToText(
  body: CreateChatCompletionBody
) {
  const completion = await openai.chat.completions.create({
    ...body,
    max_tokens: VIDEO_TO_TEXT_MAX_TOKENS,
    stream: true,
    temperature: temperature,
    // Image url is not supported with "gpt-4" model
    model: "gpt-4o",
  });
  return completion;
}

export async function openAIGPT4VChatCompletionsCreate(content: ChatCompletionContentPart[]) {
    const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
            {
                role: "user",
                content: content,
            },
        ],
        max_tokens: 3000,
    });
    return response;
}

// this does not return any token usage object
export async function openAIImagesGenerate({ prompt }: { prompt: string }) {
    const image = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
    });
    return image;
}

// export async function openAIImagesCreateVariation() {
//     const image = await openai.images.createVariation({
//         image: fs.createReadStream("local-file-path"),
//     });
//     return image;
// }

type AssistantCreateBody = Omit<AssistantCreateParams, "model">;

export async function openAIAssistantsCreate(
    assistantCreateBody: AssistantCreateParams
) {
    const assistant = await openai.beta.assistants.create(assistantCreateBody);
    return assistant;
}

export async function openAIThreadsCreate(body?: OpenAI.Beta.Threads.ThreadCreateParams) {
    const thread = await openai.beta.threads.create(body);
    return thread;
}

type FileCreateBody = Omit<FileCreateParams, "purpose">;

export async function openAIFilesCreate(fileCreateBody: FileCreateBody) {
    // Upload a file with an "assistants" purpose
    const file = await openai.files.create({
        // file: fs.createReadStream("mydata.csv"),
        ...fileCreateBody,
        purpose: "assistants",
    });
    return file;
}

export async function openAIAssistantsList(query?: AssistantListParams) {
    const myAssistants = await openai.beta.assistants.list(query);
    return myAssistants;
}

export async function openAIAssistantsRetrieve(assistantId: string) {
    const myAssistant = await openai.beta.assistants.retrieve(assistantId);
    return myAssistant;
}

export async function openAIAssistantsUpdate(
    assistantId: string,
    body: AssistantUpdateParams
) {
    const updatedAssistant = await openai.beta.assistants.update(assistantId, body);
    return updatedAssistant;
}

export async function openAIAssistantsDel(assistantId: string) {
  try {
    const response = await openai.beta.assistants.del(assistantId);
    return response;
  } catch (error) {
    const err = error as Error;
    //console.log("Got error while deleting: ", err.message);
    return error
  }
}

export async function openAIThreadsMessagesCreate(
    threadId: string,
    body: MessageCreateParams,
) {
    const message = await openai.beta.threads.messages.create(threadId, body);
    return message;
}

export async function openAIThreadsMessagesList(
    threadId: string,
    query?: MessageListParams,
) {
    const threadMessages = await openai.beta.threads.messages.list(
        threadId,
        query,
    );
    return threadMessages;
}

export async function openAIThreadsRunsList(
    threadId: string,
    query?: RunListParams
) {
    const res = await openai.beta.threads.runs.list(threadId, query);
    return res.data;
}

export async function openAIThreadRunCreate(
    threadId: string,
    body: RunCreateParams,
) {
    const createdThreadRun = await openai.beta.threads.runs.create(
        threadId,
        body
    );
    return createdThreadRun;
}

export async function openAIThreadRunGet(
    threadId: string,
    runId: string,
) {
    const threadRun = await openai.beta.threads.runs.retrieve(
        threadId,
        runId
    );
    return threadRun;
}

export async function openAIThreadsDel(threadId: string) {
  try {
    const response = await openai.beta.threads.del(threadId);
    return response;
  } catch (error) {
    const err = error as Error;
    //console.log("Could not delete thread: ", err.message);
    return error
  }
}

export async function openAIGenerateVoiceOver(
  body: SpeechCreateParams,
  options?: OpenAI.RequestOptions<Record<string, unknown> | Readable>
) {
  const mp3 = await openai.audio.speech.create(
    body,
    options
  );
  return mp3;
}
    

export async function openAITranscriptVoice(
  body: TranscriptionCreateParams,
  options?: OpenAI.RequestOptions<Record<string, unknown> | Readable>
) {
    const transcript = await openai.audio.transcriptions.create(body, options);
  return transcript;
}
    
export async function openAIThreadsGet(
    threadId: string,
    options?: OpenAI.RequestOptions<Record<string, unknown> | Readable> 
) {
    const response = await openai.beta.threads.retrieve(threadId, options);
    return response;
}

/**
 * This deletes the file from openai  
 */
export async function openAIFileDel(
  fileId: string,
  options?: OpenAI.RequestOptions<Record<string, unknown> | Readable>
) {
  try {
    const response = await openai.files.del(fileId, options);
    return response;
  } catch (error) {
    const err = error as Error;
    //console.log("Could not delete file: ", err.message);
    return error
  }
}

export async function openAIFileGet(fileId: string, options?: OpenAI.RequestOptions<Record<string, unknown> | Readable>
) {
    const response = await openai.files.retrieve(fileId, options);
    return response;
}

export async function openAIThreadsRunsSubmitToolOutputs(
    threadId: string,
    runId: string,
    body: RunSubmitToolOutputsParams
) {
    return await openai.beta.threads.runs.submitToolOutputs(
        threadId,
        runId,
        body
    );
}
const convertByteToGB = (bytes: number) => {
    const VALUE_TO_DIVIDE_TO_GET_GB_FROM_BYTE = 1e+9;
    return bytes / VALUE_TO_DIVIDE_TO_GET_GB_FROM_BYTE;
}

export async function handleThreadsRunsRequiresAction(run:Run, user?: User) {
    const toolCalls = run.required_action?.submit_tool_outputs.tool_calls;
    if (toolCalls) {
        const toolOutputs = [];
        for (const call of toolCalls) {
            const { function: fn, id: toolCallId, type } = call;

            const functionToCall = availableOpenAIFunctions[fn.name];
            // console.log("fn----->", fn);

            if (!functionToCall) {
                console.error(
                    `No matching function found for ${fn.name} in availableOpenAIFunctions`
                );
                toolOutputs.push({
                    tool_call_id: toolCallId,
                    output: "",
                });
                continue;
            }
            const functionArgs = JSON.parse(fn.arguments);
            //console.log("functionArgs----->", functionArgs);

            // call actual function with arguments received from openAI
            const functionResponse = await functionToCall({
                user: user,
                ...functionArgs,
            });

            toolOutputs.push({
                tool_call_id: toolCallId,
                output: JSON.stringify(functionResponse || "success"),
            });
            // console.log("functionResponse----->", JSON.stringify(functionResponse));
        }

        // run thread again with function call response
        const updatedRun = await openAIThreadsRunsSubmitToolOutputs(
            run.thread_id,
            run.id,
            {
                tool_outputs: toolOutputs,
            }
        );
        return updatedRun;
    }
    return run;
}

export async function waitForRunCompletion(threadId: string, runId: string, user?: User) {
    let run: Run;
    do {
        run = await openAIThreadRunGet(threadId, runId);
        // console.log(`Run status: ${run.status}`);
        if (run.status === "requires_action") {
            run = await handleThreadsRunsRequiresAction(run, user) as Run;
            // console.log(`Run handled for requires_action: ${run.status}`);
        } else if (run.status === "in_progress" || run.status === "queued") {
            // console.log(`Run status is in_progress or queued, waiting...`);
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds
        }
    } while (
        run?.status === "in_progress" ||
        run?.status === "queued" ||
        run?.status === "requires_action"
    );

    // console.log(`Final run status: ${run.status}`);
    return run;
}

export async function openAIRetrieveThreadsFromThreadIds(
    threadIds: string[],
    options?: OpenAI.RequestOptions<Record<string, unknown> | Readable>
) {
    const promiseList: APIPromise<Thread>[] = [];
    threadIds.forEach((threadId) => {
        promiseList.push(openai.beta.threads.retrieve(threadId, options));
    });
    return await Promise.all(promiseList);
}

async function getActiveRun(threadId: string): Promise<Run | null> {
    const runs = await openAIThreadsRunsList(threadId);
    return runs.find(run => run.status === 'in_progress' || run.status === 'queued') || null;
}

// streaming
export async function openAIThreadsRunsStream(
    {
        res,
        user,
        useCredit,
    }: { res: Response; user: User; useCredit?: boolean | undefined },
    threadId: string,
    body: RunCreateParamsBaseStream
) {
    let requiresAction = false;

    // Check for active run
    const activeRun = await getActiveRun(threadId);
    if (activeRun) {
        throw new Error(`Cannot start a new run. An active run (ID: ${activeRun.id}) is still in progress.`);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    const run = openai.beta.threads.runs
        .stream(threadId, body)
        .on("textCreated", (text) => process.stdout.write("\nassistant > "))
        .on("textDelta", (textDelta, snapshot) => {
            res.write(textDelta.value);
        })
        .on("toolCallCreated", (toolCall) =>
            process.stdout.write(`\nassistant > ${toolCall.type}\n\n`)
        )
        .on("event", async (streamEvent) => {
            const { data, event } = streamEvent;
            switch (event) {
                case "thread.run.requires_action": {
                    requiresAction = true;
                    await handleThreadsRunsRequiresActionStream({
                        run: data,
                        user,
                        res,
                    });
                    break;
                }

                case "thread.run.completed": {
                    if (data.usage) {
                        const { total_tokens } = data.usage;
                        const updateObject: UpdateQuery<IUserUsageStat> = { $inc: {} };
                        updateObject.$inc["totalRunTokenUsed"] =
                            total_tokens || 0;

                        if (useCredit) {
                            // find stats price document
                            const statsPrice = await findOneStatsPriceDocument(
                                {}
                            );

                            if (!statsPrice) break;

                            const { unitCost = 0, perUnit = 1 } =
                                statsPrice?.features?.tokens || {};
                            const creditUsed =
                                (unitCost / perUnit) * total_tokens;
                            updateObject.$inc["credit.used"] = creditUsed || 0;
                        }
                        await findOneAndUpdateUserUsageStatDocument(
                            { userId: user.id },
                            updateObject,
                            { upsert: true, new: true }
                        );
                    }
                    break;
                }

                default:
                    break;
            }
        })
        .on("end", () => {
            // console.log("openAIThreadsRunsStream----->end----->");
            if (!requiresAction) {
                res.end();
            }
        });
}

export async function openAIThreadsRunsStreamWithEventHandler(
    { req, res }: { req: Request; res: Response },
    threadId: string,
    body: RunCreateParamsBaseStream
) {
    const eventHandler = new OpenAIAssistantStreamEventHandler({
        openai,
        req,
        res,
    });
    eventHandler.on("event", eventHandler.onEvent.bind(eventHandler));

    const stream = openai.beta.threads.runs.stream(threadId, body);

    for await (const event of stream) {
        eventHandler.emit("event", event);
    }
}

export async function openAIThreadsRunsSubmitToolOutputsStream(
    {
        res,
        user,
        useCredit,
    }: { res: Response; user: User; useCredit?: boolean | undefined },
    threadId: string,
    runId: string,
    body: RunSubmitToolOutputsParamsStream
) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");

    // Check for active run
    const activeRun = await getActiveRun(threadId);
    if (activeRun && activeRun.id !== runId) {
        throw new Error(`Cannot submit tool outputs. Another active run (ID: ${activeRun.id}) is still in progress.`);
    }

    const run = openai.beta.threads.runs
        .submitToolOutputsStream(threadId, runId, body)
        .on("textCreated", (text) => process.stdout.write("\nassistant > "))
        .on("textDelta", (textDelta, snapshot) => {
            res.write(textDelta.value);
        })
        .on("event", async (streamEvent) => {
            const { data, event } = streamEvent;
            switch (event) {
                case "thread.run.completed": {
                    if (data.usage) {
                        const { total_tokens } = data.usage;
                        const updateObject: UpdateQuery<IUserUsageStat> = { $inc: {} };
                        updateObject.$inc["totalRunTokenUsed"] =
                            total_tokens || 0;

                        if (useCredit) {
                            // find stats price document
                            const statsPrice = await findOneStatsPriceDocument(
                                {}
                            );

                            if (!statsPrice) break;

                            const { unitCost = 0, perUnit = 1 } =
                                statsPrice?.features?.tokens || {};
                            const creditUsed =
                                (unitCost / perUnit) * total_tokens;
                            updateObject.$inc["credit.used"] = creditUsed || 0;
                        }
                        await findOneAndUpdateUserUsageStatDocument(
                            { userId: user.id },
                            updateObject,
                            { upsert: true, new: true }
                        );
                    }
                    break;
                }

                default:
                    break;
            }
        })
        .on("end", async () => {
            // console.log("openAIThreadsRunsSubmitToolOutputsStream-----end----->");

            // Add a small delay before checking the run status
            await new Promise((resolve) => setTimeout(resolve, 600)); // Wait for 2 seconds

            // Explicitly check and log the run status after stream ends
            const runStatus = await openAIThreadRunGet(threadId, runId);
            // console.log(`Run status after stream ends: ${runStatus.status}`);
            // console.log(`Run details: ${JSON.stringify(runStatus)}`);

            if (runStatus.status === "requires_action") {
                await handleThreadsRunsRequiresActionStream({
                    run: runStatus,
                    user,
                    res,
                });
            } else {
                res.end();
            }
        });
    return run;
}

export async function handleThreadsRunsRequiresActionStream({
    run,
    user,
    res,
}: {
    run: Run;
    user: User;
    res: Response;
}) {
    const toolCalls = run.required_action?.submit_tool_outputs.tool_calls;
    if (toolCalls) {
        const toolOutputs = [];
        for (const call of toolCalls) {
            const { function: fn, id: toolCallId, type } = call;

            const functionToCall = availableOpenAIFunctions[fn.name];
            // console.log("fn----->", fn);

            if (!functionToCall) {
                console.error(
                    `No matching function found for ${fn.name} in availableOpenAIFunctions`
                );
                toolOutputs.push({
                    tool_call_id: toolCallId,
                    output: "",
                });
                continue;
            }
            const functionArgs = JSON.parse(fn.arguments);

            // call actual function with arguments received from openAI
            const functionResponse = await functionToCall({
                user: user,
                ...functionArgs,
            });

            toolOutputs.push({
                tool_call_id: toolCallId,
                output: JSON.stringify(functionResponse || "success"),
            });
            // console.log("functionResponse----->", JSON.stringify(functionResponse));
        }

        // Add a small delay before checking the run status
        await new Promise((resolve) => setTimeout(resolve, 600)); // Wait for 2 seconds

        // Check the run status before submitting tool outputs
        const runStatus = await openAIThreadRunGet(run.thread_id, run.id);
        if (runStatus.status === "requires_action") {
            // Run thread again with function call response and log the status
            const updatedRun = await openAIThreadsRunsSubmitToolOutputsStream(
                { res, user },
                run.thread_id,
                run.id,
                {
                    tool_outputs: toolOutputs,
                }
            );

        const runStatus = await openAIThreadRunGet(run.thread_id, run.id);
        // console.log(`Run status after handling requires_action: ${runStatus.status}`);
        // console.log(`Run details: ${JSON.stringify(runStatus)}`);

            return updatedRun;
        } else {
            // console.log(`Cannot submit tool outputs, run status is: ${runStatus.status}`);
        }
    }
    return run;
}

export async function openAIVectorStoresFileBatchesCreate(
    vectorStoreId: string,
    body: FileBatchCreateParams
) {
    return await openai.beta.vectorStores.fileBatches.create(vectorStoreId, body);
}

export async function openAIVectorStoresFilesList(
    vectorStoreId: string,
    query?: FileListParams
) {
    return await openai.beta.vectorStores.files.list(vectorStoreId, query);
}

export async function openAIVectorStoresDel(
    vectorStoreId: string,
) {
    return await openai.beta.vectorStores.del(vectorStoreId);
}

export async function openAIVectorStoresFilesDel(
    vectorStoreId: string,
    fileId: string
) {
    return await openai.beta.vectorStores.files.del(vectorStoreId, fileId);
}

export async function openAIVectorStoresCreate(body: VectorStoreCreateParams) {
    return await openai.beta.vectorStores.create(body);
}

export async function openAIThreadsRunsCancel(threadId: string, runId: string) {
    return await openai.beta.threads.runs.cancel(threadId, runId);
}

export async function handleOpenAIUsage({
    usage,
    req,
}: {
    usage: Run.Usage;
    req: Request;
}) {
    const { total_tokens } = usage;
    const userId = req.user?.id;
    const updateObject: UpdateQuery<IUserUsageStat> = { $inc: {} };
    updateObject.$inc["totalRunTokenUsed"] = total_tokens || 0;

    if (req.useCredit) {
        // find stats price document
        const statsPrice = await findOneStatsPriceDocument({});

        if (!statsPrice) return;

        const { unitCost = 0, perUnit = 1 } = statsPrice?.features?.tokens || {};
        const creditUsed = (unitCost / perUnit) * total_tokens;
        updateObject.$inc["credit.used"] = creditUsed || 0;
    }
    await findOneAndUpdateUserUsageStatDocument(
        { userId: userId },
        updateObject,
        { upsert: true, new: true }
    );
}
