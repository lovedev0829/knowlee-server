import { gmail_v1, google } from "googleapis";

export async function gmailUsersGetProfile(
    params: gmail_v1.Params$Resource$Users$Getprofile
) {
    const res = await google.gmail("v1").users.getProfile(params);
    return res.data;
}

export async function gmailUsersMessagesList(
    params: gmail_v1.Params$Resource$Users$Messages$List
) {
    const res = await google.gmail("v1").users.messages.list(params);
    return res.data;
}

export async function gmailUsersMessagesGet(
    params: gmail_v1.Params$Resource$Users$Messages$Get
) {
    const res = await google.gmail("v1").users.messages.get(params);
    return res.data;
}

export async function gmailUsersMessagesTrash(
    params: gmail_v1.Params$Resource$Users$Messages$Trash
) {
    const res = await google.gmail("v1").users.messages.trash(params);
    return res.data;
}

export async function gmailUsersMessagesUntrash(
    params: gmail_v1.Params$Resource$Users$Messages$Untrash
) {
    const res = await google.gmail("v1").users.messages.untrash(params);
    return res.data;
}

export async function gmailUsersMessagesSend(
    params: gmail_v1.Params$Resource$Users$Messages$Send
) {
    const res = await google.gmail("v1").users.messages.send(params);
    return res.data;
}

export async function gmailUsersMessagesAttachmentsGet(
    params: gmail_v1.Params$Resource$Users$Messages$Attachments$Get
) {
    const res = await google.gmail("v1").users.messages.attachments.get(params);
    return res.data;
}

export async function gmailUsersThreadsGet(
    params: gmail_v1.Params$Resource$Users$Threads$Get
) {
    const res = await google.gmail("v1").users.threads.get(params);
    return res.data;
}

export async function gmailUsersThreadsList(
    params: gmail_v1.Params$Resource$Users$Threads$List
) {
    const res = await google.gmail("v1").users.threads.list(params);
    return res.data;
}

export async function gmailUsersThreadsTrash(
    params: gmail_v1.Params$Resource$Users$Threads$Trash
) {
    const res = await google.gmail("v1").users.threads.trash(params);
    return res.data;
}

export async function gmailUsersThreadsUntrash(
    params: gmail_v1.Params$Resource$Users$Threads$Untrash
) {
    const res = await google.gmail("v1").users.threads.untrash(params);
    return res.data;
}
