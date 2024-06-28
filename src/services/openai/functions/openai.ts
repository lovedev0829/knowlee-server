import { MessageCreateParams } from "openai/resources/beta/threads/messages";
import { User } from "../../../models/user.model";
import {
    openAIThreadRunCreate,
    openAIThreadRunGet,
    openAIThreadsCreate,
    openAIThreadsMessagesCreate,
} from "../../openAI.services";
import { RunCreateParams } from "openai/resources/beta/threads/runs/runs";
import OpenAI from "openai";

export async function openAIThreadsCreateFunction({
    body,
}: {
    body?: OpenAI.Beta.Threads.ThreadCreateParams;
}) {
    try {
        const res = await openAIThreadsCreate(body);
        return res;
    } catch (error: any) {
        //console.log("error----->", error);
        return error?.message;
    }
}

export async function openAIThreadsMessagesCreateFunction({
    user,
    threadId,
    body,
}: {
    user: User;
    threadId: string;
    body: MessageCreateParams;
}) {
    try {
        const res = await openAIThreadsMessagesCreate(threadId, body);
        return res;
    } catch (error: any) {
        //console.log("error----->", error);
        return error?.message;
    }
}

export async function openAIThreadsRunsCreateFunction({
    user,
    threadId,
    body,
}: {
    user: User;
    threadId: string;
    body: RunCreateParams;
}) {
    try {
        const res = await openAIThreadRunCreate(threadId, body);
        return res;
    } catch (error: any) {
        //console.log("error----->", error);
        return error?.message;
    }
}

export async function openAIThreadsRunsRetrieveFunction({
    user,
    threadId,
    runId,
}: {
    user: User;
    threadId: string;
    runId: string;
}) {
    try {
        const res = await openAIThreadRunGet(threadId, runId);
        return res;
    } catch (error: any) {
        //console.log("error----->", error);
        return error?.message;
    }
}
