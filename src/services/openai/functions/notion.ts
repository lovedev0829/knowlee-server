import axios from "axios";
import { RequestError } from "../../../utils/globalErrorHandler";
import {
    handleHttpGet,
    handleHttpPost,
    getTokenByUser
} from "../../../lib/notion/notion.services";

import {
    User
} from "../../../models/user.model";


interface notionParams{
    databaseId: string,
    pageId: string,
    blockId: string,
    items: object
}

export async function notionRetreiveDatabaseGetFunction({
    user,
    ...params
    }: {
    user: User;
    }&notionParams) {
    try {
        if (!user) return "please provide user";
        const { id: userId } = user;
        const {databaseId: databaseId} = params;
        const accessToken = await getTokenByUser({ userId: userId });
        const httpURL = `databases/${databaseId}`;
        const response = await handleHttpGet({accessToken, httpURL});
        return response;
        
    } catch (error: any) {
        //console.log("error----->", error);
        return error?.message;
    }
}

export async function notionQueryDatabasePostFunction({
    user,
    ...params
    }: {
    user: User;
    }&notionParams) {
    try {
        if (!user) return "please provide user";
        const { id: userId } = user;
        const {databaseId: databaseId} = params;
        const accessToken = await getTokenByUser({ userId: userId });
        const httpURL = `databases/${databaseId}/query`;
        const httpMethod = `POST`;
        const { ["databaseId"]: unused, ...rest } = params
        const response = await handleHttpPost({accessToken, httpURL, httpMethod, ...rest});

        return response;
        
    } catch (error: any) {
        //console.log("error----->", error);
        return error?.message;
    }
}

export async function notionCreatePagesPostFunction({
    user,
    ...params
    }: {
    user: User;
    }) {
    try {

        if (!user) return "please provide user";
        const { id: userId } = user;
        const accessToken = await getTokenByUser({ userId: userId });
        const httpURL = `pages`;
        const httpMethod = `POST`;
        const response = await handleHttpPost({accessToken, httpURL, httpMethod, ...params});

        return response;
        
    } catch (error: any) {
        //console.log("error----->", error);
        return error?.message;
    }
}

export async function notionCreatePagesByContentPostFunction({
    user,
    ...params
    }: {
    user: User;
    }) {
    try {
        if (!user) return "please provide user";
        const { id: userId } = user;
        const accessToken = await getTokenByUser({ userId: userId });
        const httpURL = `pages`;
        const httpMethod = `POST`;
        const response = await handleHttpPost({accessToken, httpURL, httpMethod, ...params});

        return response;
        
    } catch (error: any) {
        //console.log("error----->", error);
        return error?.message;
    }
}

export async function notionRetrievePagesGetFunction({
    user,
    ...params
    }: {
    user: User;
    }&notionParams) {
    try {
        if (!user) return "please provide user";
        const { id: userId } = user;
        const {pageId: pageId} = params;
        const accessToken = await getTokenByUser({ userId: userId });
        const httpURL = `pages/${pageId}`;
        const response = await handleHttpGet({accessToken, httpURL});
        return response;
        
    } catch (error: any) {
        //console.log("error----->", error);
        return error?.message;
    }
}

export async function notionRetrieveBlockChildrenGetFunction({
    user,
    ...params
    }: {
    user: User;
    }&notionParams) {
    try {
        if (!user) return "please provide user";
        const { id: userId } = user;
        const {blockId: blockId} = params;
        const accessToken = await getTokenByUser({ userId: userId });
        const httpURL = `blocks/${blockId}/children?page_size=100`;
        const response = await handleHttpGet({accessToken, httpURL});
        return response;
        
    } catch (error: any) {
        //console.log("error----->", error);
        return error?.message;
    }
}

export async function notionAppendBlockChildrenPatchFunction({
    user,
    ...params
    }: {
    user: User;
    }&notionParams) {
    try {

        if (!user) return "please provide user";
        const { id: userId } = user;
        const accessToken = await getTokenByUser({ userId: userId });
        const {blockId: blockId} = params;
        const httpURL = `blocks/${blockId}/children`;
        const httpMethod = `Patch`;
        const { ["blockId"]: unused, ...rest } = params
        const response = await handleHttpPost({accessToken, httpURL, httpMethod, ...rest});

        return response;
        
    } catch (error: any) {
        //console.log("error----->", error);
        return error?.message;
    }
}

export async function notionUpdateBlockPatchFunction({
    user,
    ...params
    }: {
    user: User;
    }&notionParams) {
    try {

        if (!user) return "please provide user";
        const { id: userId } = user;
        const accessToken = await getTokenByUser({ userId: userId });
        const {pageId: pageId} = params;
        const httpURL = `pages/${pageId}`;
        const httpMethod = `Patch`;
        const { ["pageId"]: unused, ...rest } = params
        const response = await handleHttpPost({accessToken, httpURL, httpMethod, ...rest});

        return response;
        
    } catch (error: any) {
        //console.log("error----->", error);
        return error?.message;
    }
}

export async function notionRetriveBlockGetFunction({
    user,
    ...params
    }: {
    user: User;
    }&notionParams) {
    try {
        if (!user) return "please provide user";
        const { id: userId } = user;
        const {blockId: blockId} = params;
        const accessToken = await getTokenByUser({ userId: userId });
        const httpURL = `blocks/${blockId}`;
        const response = await handleHttpGet({accessToken, httpURL});
        return response;
        
    } catch (error: any) {
        //console.log("error----->", error);
        return error?.message;
    }
}

export async function notionRemoveBlockDeleteFunction({
    user,
    ...params
    }: {
    user: User;
    }&notionParams) {
    try {
        if (!user) return "please provide user";
        const { id: userId } = user;
        const {blockId: blockId} = params;
        const accessToken = await getTokenByUser({ userId: userId });
        const httpURL = `blocks/${blockId}`;
        const httpMethod = `Delete`;
        const { ["blockId"]: unused, ...rest } = params
        const response = await handleHttpPost({accessToken, httpURL, httpMethod, ...rest});
        return response;
        
    } catch (error: any) {
        //console.log("error----->", error);
        return error?.message;
    }
}


export async function notionSearchPostFunction({
    user,
    ...params
    }: {
    user: User;
    }) {
    try {
        if (!user) return "please provide user";
        const { id: userId } = user;
        const accessToken = await getTokenByUser({ userId: userId });
        const httpURL = `search`;
        const httpMethod = `Post`;
        const response = await handleHttpPost({accessToken, httpURL, httpMethod, ...params});
        return response;
        
    } catch (error: any) {
        //console.log("error----->", error);
        return error?.message;
    }
}


export async function notionRetriveCommentsGetFunction({
    user,
    ...params
    }: {
    user: User;
    }&notionParams) {
    try {
        if (!user) return "please provide user";
        const { id: userId } = user;
        const {blockId: blockId} = params;
        const accessToken = await getTokenByUser({ userId: userId });
        const httpURL = `comments?block_id=${blockId}&page_size=100`;
        const response = await handleHttpGet({accessToken, httpURL});
        return response;
        
    } catch (error: any) {
        //console.log("error----->", error);
        return error?.message;
    }
}

export async function notionAddCommentToPagePostFunction({
    user,
    ...params
    }: {
    user: User;
    }) {
    try {
        if (!user) return "please provide user";
        const { id: userId } = user;
        const accessToken = await getTokenByUser({ userId: userId });
        const httpURL = `comments`;
        const httpMethod = `Post`;
        const response = await handleHttpPost({accessToken, httpURL, httpMethod, ...params});
        return response;
        
    } catch (error: any) {
        //console.log("error----->", error);
        return error?.message;
    }
}

export async function notionAddCommentToDiscussionPostFunction({
    user,
    ...params
    }: {
    user: User;
    }) {
    try {
        if (!user) return "please provide user";
        const { id: userId } = user;
        const accessToken = await getTokenByUser({ userId: userId });
        const httpURL = `comments`;
        const httpMethod = `Post`;
        const response = await handleHttpPost({accessToken, httpURL, httpMethod, ...params});
        return response;
        
    } catch (error: any) {
        //console.log("error----->", error);
        return error?.message;
    }
}