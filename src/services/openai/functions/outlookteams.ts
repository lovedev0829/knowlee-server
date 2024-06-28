import {
    getMicrosoftTokenOfUser,
} from "../../../lib/microsoft/microsoft.services";

import {
    getUsersJoinedTeams,
    getMembersofTeam,
    getChannelsofTeam,
    getChannelInfo,
    getItemsByGroupId,
    createTeamsChat,
    sendChannelMsg
} from "../../../lib/outlook/outlookteams.service";

import {
    User
} from "../../../models/user.model";

interface OutlookTeamsParams {
    teamId: string,
    channelId:string,
    groupId:string
}

export async function outlookTeamsUsersJoinedTeamsGet({
    user,
}: {
    user: User;
}) {
    try {

        if (!user) return "please provide user";
        const {
            id: userId
        } = user;
        const accessToken = await getMicrosoftTokenOfUser({
            userId: userId
        });
        const {
            access_token: token
        } = accessToken;

        const res = await getUsersJoinedTeams({
            token: token
        });
        return res;

    } catch (error: any) {

        //console.log("error----->", error);

        return error?.message;
    }
}


export async function outlookTeamsUsersMemebersGet({
    user,
    ...params
}: {
    user: User;
}&OutlookTeamsParams) {
    try {

        if (!user) return "please provide user";
        const {
            id: userId
        } = user;
        const accessToken = await getMicrosoftTokenOfUser({
            userId: userId
        });
        const {
            access_token: token
        } = accessToken;

        const res = await getMembersofTeam({
            token: token,
            teamId: params?.teamId
        });
        return res;

    } catch (error: any) {

        //console.log("error----->", error);

        return error?.message;
    }
}

export async function outlookTeamsUsersChannelsGet({
    user,
    ...params
}: {
    user: User;
}&OutlookTeamsParams) {
    try {

        if (!user) return "please provide user";
        const {
            id: userId
        } = user;
        const accessToken = await getMicrosoftTokenOfUser({
            userId: userId
        });
        const {
            access_token: token
        } = accessToken;

        const res = await getChannelsofTeam({
            token: token,
            teamId: params?.teamId
        });
        return res;

    } catch (error: any) {

        //console.log("error----->", error);

        return error?.message;
    }
}

export async function outlookTeamsUsersChannelInfoGet({
    user,
    ...params
}: {
    user: User;
}&OutlookTeamsParams) {
    try {

        if (!user) return "please provide user";
        const {
            id: userId
        } = user;
        const accessToken = await getMicrosoftTokenOfUser({
            userId: userId
        });
        const {
            access_token: token
        } = accessToken;

        const res = await getChannelInfo({
            token: token,
            teamId: params?.teamId,
            channelId: params?.channelId
        });
        return res;

    } catch (error: any) {

        //console.log("error----->", error);

        return error?.message;
    }
}

export async function outlookTeamsUsersItemsGet({
    user,
    ...params
}: {
    user: User;
}&OutlookTeamsParams) {
    try {

        if (!user) return "please provide user";
        const {
            id: userId
        } = user;
        const accessToken = await getMicrosoftTokenOfUser({
            userId: userId
        });
        const {
            access_token: token
        } = accessToken;

        const res = await getItemsByGroupId({
            token: token,
            groupId: params?.groupId
        });
        return res;

    } catch (error: any) {

        //console.log("error----->", error);

        return error?.message;
    }
}

export async function outlookTeamsUsersChatCreate({
    user,
    ...params
}: {
    user: User;
}) {
    try {

        if (!user) return "please provide user";
        const {
            id: userId
        } = user;
        const accessToken = await getMicrosoftTokenOfUser({
            userId: userId
        });
        const {
            access_token: token
        } = accessToken;

        const res = await createTeamsChat({
            token: token,
            ...params
        });
        return res;

    } catch (error: any) {

        //console.log("error----->", error);

        return error?.message;
    }
}

export async function outlookTeamsUsersChannelMsgSend({
    user,
    ...params
}: {
    user: User;
}&OutlookTeamsParams) {
    try {

        if (!user) return "please provide user";
        const {
            id: userId
        } = user;
        const accessToken = await getMicrosoftTokenOfUser({
            userId: userId
        });
        const {
            access_token: token
        } = accessToken;

        const res = await sendChannelMsg({
            token: token,
            ...params
        });
        return res;

    } catch (error: any) {

        //console.log("error----->", error);

        return error?.message;
    }
}
