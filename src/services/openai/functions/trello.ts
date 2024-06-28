import axios from "axios";
import { User } from "../../../models/user.model";
import { findOneThirdPartyConfig } from "../../thirdPartyConfig.services";

const TRELLO_API_BASE_URL = "https://api.trello.com/1";
const TRELLO_API_KEY = process.env.TRELLO_API_KEY!;

type TrelloCardViewFilter = "all" | "closed" | "none" | "open";
interface TrelloCard {
    id: string;
    name: string;
    shortUrl: string;
    desc?: string;
    due?: string;
    dueComplete?: boolean;
    labels?: Array<{ id: string; name: string; color: string }>;
    idList: string;
    idBoard: string;
    dateLastActivity?: string;
    actions?: Array<{ id: string; type: string; date: string; data: any }>;
    checklists?: Array<{
        id: string;
        name: string;
        checkItems: Array<{ id: string; name: string; state: string }>;
    }>;
    attachments?: Array<{ id: string; name: string; url: string }>;
    [key: string]: any; // To allow additional properties
}


function trimTrelloData(data: TrelloCard): TrelloCard {
    const trimmedData = {
        id: data.id,
        name: data.name,
        shortUrl: data.shortUrl,
        desc: data.desc,
        comments: data.comments,
        attachments: data.attachments,
        due: data.due,
        start: data.start,
        dateLastActivity: data.dateLastActivity,
        idMembers: data.idMembers,
        dueComplete: data.dueComplete, // Include due complete status
        labels: data.labels ? data.labels.slice(0, 5) : [], // Limit to 5 labels
        idList: data.idList, // Include list ID
        idBoard: data.idBoard, // Include board ID
        // Add other necessary fields here
    };

    // Truncate long text fields if necessary
    if (data.desc && data.desc.length > 200000) {
        trimmedData.desc = data.desc.substring(0, 200000) + "...";
    }

    return trimmedData;
}

export async function trelloGetACardFunction({
    user,
    id,
    fields,
    actions,
    attachments,
    attachment_fields,
    members,
    member_fields,
    membersVoted,
    memberVoted_fields,
    checkItemStates,
    checklists,
    checklist_fields,
    board,
    board_fields,
    list,
    pluginData,
    stickers,
    sticker_fields,
    customFieldItems,
}: {
    user: User;
    id: string;
    fields?: string;
    actions?: string;
    attachments?: string | boolean;
    attachment_fields?: string;
    members?: boolean;
    member_fields?: string;
    membersVoted?: boolean;
    memberVoted_fields?: string;
    checkItemStates?: boolean;
    checklists?: string;
    checklist_fields?: string;
    board?: boolean;
    board_fields?: string;
    list?: boolean;
    pluginData?: boolean;
    stickers?: boolean;
    sticker_fields?: string;
    customFieldItems?: boolean;
}) {
    try {
        if (!user) return "please provide user";
        const { id: userId } = user;

        const thirdPartyConfig = await findOneThirdPartyConfig({ userId: userId });
        if (!thirdPartyConfig) {
            throw new Error("Not Authorized: No third party config found");
        }

        const accessToken = thirdPartyConfig?.trello?.token?.access_token;
        if (!accessToken) {
            throw new Error(
                "Not Authorized: trello access_token not found in third party config"
            );
        }
        const res = await axios.get(`${TRELLO_API_BASE_URL}/cards/${id}`, {
            params: {
                key: TRELLO_API_KEY,
                token: accessToken,
                fields,
                actions,
                attachments,
                attachment_fields,
                members,
                member_fields,
                membersVoted,
                memberVoted_fields,
                checkItemStates,
                checklists,
                checklist_fields,
                board,
                board_fields,
                list,
                pluginData,
                stickers,
                sticker_fields,
                customFieldItems,
            },
        });

        const trimmedData = trimTrelloData(res.data);
        return trimmedData;
    } catch (error: any) {
        const errorMessage = error.response ? error.response.data : error.message;
        //console.log("Error ----->", errorMessage);
        return errorMessage;
    }
}

export async function trelloGetBoardsThatMemberBelongsToFunction({
    user,
    id = "me",
    filter,
    fields,
    lists,
    organization,
    organization_fields,
}: {
    user: User;
    id: string;
    filter: string;
    fields: string;
    lists: string;
    organization: boolean;
    organization_fields: string;
}) {
    try {
        if (!user) return "please provide user";
        const { id: userId } = user;

        const thirdPartyConfig = await findOneThirdPartyConfig({ userId: userId });
        if (!thirdPartyConfig) {
            throw new Error("Not Authorized: No third party config found");
        }

        const accessToken = thirdPartyConfig?.trello?.token?.access_token;
        if (!accessToken) {
            throw new Error(
                "Not Authorized: trello access_token not found in third party config"
            );
        }
        const res = await axios.get(`${TRELLO_API_BASE_URL}/members/${id}/boards`, {
            params: {
                key: TRELLO_API_KEY,
                token: accessToken,
                filter,
                fields,
                lists,
                organization,
                organization_fields,
            },
        });

        // Trim and return the data
        const trimmedData = res.data.map(trimTrelloData);
        return trimmedData;
    } catch (error: any) {
        const errorMessage = error.response ? error.response.data : error.message;
        //console.log("Error ----->", errorMessage);
        return errorMessage;
    }
}

export async function trelloGetCardsInAListFunction({
    user,
    id,
}: {
    user: User;
    id: string;
}) {
    try {
        if (!user) return "please provide user";
        const { id: userId } = user;

        const thirdPartyConfig = await findOneThirdPartyConfig({ userId: userId });
        if (!thirdPartyConfig) {
            throw new Error("Not Authorized: No third party config found");
        }

        const accessToken = thirdPartyConfig?.trello?.token?.access_token;
        if (!accessToken) {
            throw new Error(
                "Not Authorized: trello access_token not found in third party config"
            );
        }
        const res = await axios.get(`${TRELLO_API_BASE_URL}/lists/${id}/cards`, {
            params: {
                key: TRELLO_API_KEY,
                token: accessToken,
            },
        });

        // Trim and return the data
        const trimmedData = res.data.map(trimTrelloData);
        return trimmedData;
    } catch (error: any) {
        const errorMessage = error.response ? error.response.data : error.message;
        //console.log("Error ----->", errorMessage);
        return errorMessage;
    }
}

export async function trelloGetListsOnABoardFunction({
    user,
    id,
    cards,
    card_fields,
    filter,
    fields,
}: {
    user: User;
    id: string;
    cards?: TrelloCardViewFilter;
    card_fields?: string | "all";
    filter?: TrelloCardViewFilter;
    fields?: string | "all";
}) {
    try {
        if (!user) return "please provide user";
        const { id: userId } = user;

        const thirdPartyConfig = await findOneThirdPartyConfig({ userId: userId });
        if (!thirdPartyConfig) {
            throw new Error("Not Authorized: No third party config found");
        }

        const accessToken = thirdPartyConfig?.trello?.token?.access_token;
        if (!accessToken) {
            throw new Error(
                "Not Authorized: trello access_token not found in third party config"
            );
        }
        const res = await axios.get(`${TRELLO_API_BASE_URL}/boards/${id}/lists`, {
            params: {
                key: TRELLO_API_KEY,
                token: accessToken,
                cards,
                card_fields,
                filter,
                fields,
            },
        });

        // Trim and return the data
        const trimmedData = res.data.map(trimTrelloData);
        return trimmedData;
    } catch (error: any) {
        const errorMessage = error.response ? error.response.data : error.message;
        //console.log("Error ----->", errorMessage);
        return errorMessage;
    }
}
