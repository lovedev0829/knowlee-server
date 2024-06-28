import axios, { AxiosError } from "axios";
import { User } from "../../../models/user.model";
import { findOneAndUpdateThirdPartyConfig, findOneThirdPartyConfig } from "../../thirdPartyConfig.services";
import { getGoogleOAuth2ClientOfUser } from "../../../lib/google/google.services";
import { UpdateQuery } from "mongoose";
import { ThirdPartyConfig } from "../../../models/third-party/ThirdPartyConfig.model";
import { encryptData } from "../../../utils/encryption";

// export const MEDIUM_BASE_URL = "https://keep.googleapis.com/v1/";
export const GOOGLE_KEEP_BASE_URL = "https://keep.googleapis.com/v1";

interface NoteBody {
    text: string;
    list: string[];
}

export async function gKeepCreateNoteFunction({
    user,
    title,
    body,
}: {
    user: User;
    title: string;
    body: NoteBody;
}) {
    if (!user) return "please provide user";
    const { id: userId } = user;
    const thirdPartyConfig = await findOneThirdPartyConfig({ userId: userId });
    if (!thirdPartyConfig) {
        throw new Error("Not Authorized: No third party config found");
    }

    let google_access_token = thirdPartyConfig?.google?.token?.access_token;

    // logic to refresh the token if the token is expired
    const expiryDate = thirdPartyConfig?.google?.token?.expiry_date;
    if (expiryDate && expiryDate < Date.now()) {
        // console.log(" *** INSIDE EXPIRY DATE CHECK *** \n");
        const auth = await getGoogleOAuth2ClientOfUser({ userId: userId });
        const { credentials } = await auth.refreshAccessToken();

        const updateObject: UpdateQuery<ThirdPartyConfig> = {};

        updateObject[`google.token.access_token`] = encryptData(credentials.access_token!);
        updateObject["google.token.expiry_date"] = credentials.expiry_date;

        const updatedObj = await findOneAndUpdateThirdPartyConfig(
            { userId },
            updateObject,
            {
                upsert: true,
                new: true,
            }
        );
        google_access_token = updatedObj?.google?.token?.access_token;
    }
    // Define the payload
    const payload = {
        title,
        body,
    };

    // Define the API endpoint
    const endpoint = `${GOOGLE_KEEP_BASE_URL}/notes`;
    // console.log("END POINT === >>> ", endpoint);

    // Define the authorization token
    const authToken = `Bearer ${google_access_token}`;

    // Make the API call
    try {
        const response = await axios.post(endpoint, payload, {
            headers: {
                Authorization: authToken,
                "Content-Type": "application/json",
                Accept: "application/json",
                "Accept-Charset": "utf-8",
            },
        });
        // console.log("Note Created successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating note on Google Keep:", (error as AxiosError)?.response?.data);
        // throw error;
    }
}

export async function gKeepDeleteNoteFunction({
    user,
    name,
}: {
    user: User;
    name: string;
}) {
    if (!user) return "please provide user";
    const { id: userId } = user;
    const thirdPartyConfig = await findOneThirdPartyConfig({ userId: userId });
    if (!thirdPartyConfig) {
        throw new Error("Not Authorized: No third party config found");
    }

    let google_access_token = thirdPartyConfig?.google?.token?.access_token;

    // logic to refresh the token if the token is expired
    const expiryDate = thirdPartyConfig?.google?.token?.expiry_date;
    if (expiryDate && expiryDate < Date.now()) {
        const auth = await getGoogleOAuth2ClientOfUser({ userId: userId });
        const { credentials } = await auth.refreshAccessToken();

        const updateObject: UpdateQuery<ThirdPartyConfig> = {};

        updateObject[`google.token.access_token`] = encryptData(credentials.access_token!);
        updateObject["google.token.expiry_date"] = credentials.expiry_date;

        const updatedObj = await findOneAndUpdateThirdPartyConfig(
            { userId },
            updateObject,
            {
                upsert: true,
                new: true,
            }
        );
        google_access_token = updatedObj?.google?.token?.access_token;
    }

    // Define the API endpoint
    const endpoint = `${GOOGLE_KEEP_BASE_URL}/?name=${name}`;

    // Define the authorization token
    const authToken = `Bearer ${google_access_token}`;

    // Make the API call
    try {
        const response = await axios.delete(endpoint, {
            headers: {
                Authorization: authToken,
                "Content-Type": "application/json",
                Accept: "application/json",
                "Accept-Charset": "utf-8",
            },
        });
        // console.log("Note Deleted successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error deleting note on Google Keep:", (error as AxiosError)?.response?.data);
        // throw error;
    }
}

export async function gKeepGetNoteFunction({
    user,
    name,
}: {
    user: User;
    name: string;
}) {
    if (!user) return "please provide user";
    const { id: userId } = user;
    const thirdPartyConfig = await findOneThirdPartyConfig({ userId: userId });
    if (!thirdPartyConfig) {
        throw new Error("Not Authorized: No third party config found");
    }

    let google_access_token = thirdPartyConfig?.google?.token?.access_token;

    // logic to refresh the token if the token is expired
    const expiryDate = thirdPartyConfig?.google?.token?.expiry_date;
    if (expiryDate && expiryDate < Date.now()) {
        const auth = await getGoogleOAuth2ClientOfUser({ userId: userId });
        const { credentials } = await auth.refreshAccessToken();

        const updateObject: UpdateQuery<ThirdPartyConfig> = {};

        updateObject[`google.token.access_token`] = encryptData(credentials.access_token!);
        updateObject["google.token.expiry_date"] = credentials.expiry_date;

        const updatedObj = await findOneAndUpdateThirdPartyConfig(
            { userId },
            updateObject,
            {
                upsert: true,
                new: true,
            }
        );
        google_access_token = updatedObj?.google?.token?.access_token;
    }
    // Define the API endpoint
    const endpoint = `${GOOGLE_KEEP_BASE_URL}/?name=${name}`;

    // Define the authorization token
    const authToken = `Bearer ${google_access_token}`;

    // Make the API call
    try {
        const response = await axios.post(endpoint, {}, {
            headers: {
                Authorization: authToken,
                "Content-Type": "application/json",
                Accept: "application/json",
                "Accept-Charset": "utf-8",
            },
        });
        // console.log("Note Retrieved successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error retrieving note on Google Keep:", (error as AxiosError)?.response?.data);
        // throw error;
    }
}

export async function gKeepListNotesFunction({
    user,
    pageSize, 
    pageToken,
    filter
}: {
    user: User;
    pageSize: number;
    pageToken: string;
    filter: string;
}) {
    if (!user) return "please provide user";
    const { id: userId } = user;
    const thirdPartyConfig = await findOneThirdPartyConfig({ userId: userId });
    if (!thirdPartyConfig) {
        throw new Error("Not Authorized: No third party config found");
    }

    let google_access_token = thirdPartyConfig?.google?.token?.access_token;

    // logic to refresh the token if the token is expired
    const expiryDate = thirdPartyConfig?.google?.token?.expiry_date;
    if (expiryDate && expiryDate < Date.now()) {
        const auth = await getGoogleOAuth2ClientOfUser({ userId: userId });
        const { credentials } = await auth.refreshAccessToken();

        const updateObject: UpdateQuery<ThirdPartyConfig> = {};

        updateObject[`google.token.access_token`] = encryptData(credentials.access_token!);
        updateObject["google.token.expiry_date"] = credentials.expiry_date;

        const updatedObj = await findOneAndUpdateThirdPartyConfig(
            { userId },
            updateObject,
            {
                upsert: true,
                new: true,
            }
        );
        google_access_token = updatedObj?.google?.token?.access_token;
    }
    let endpoint = `${GOOGLE_KEEP_BASE_URL}/notes`;
    // Define the API endpoint
    if (pageSize !== undefined) {
        endpoint += `?pageSize=${pageSize}`;
    }
    if (pageToken !== undefined) {
        endpoint += `${pageSize !== undefined ? "&" : "?"}pageToken=${pageToken}`;
    }
    if (filter !== undefined) {
        endpoint += `${pageSize !== undefined || pageToken !== undefined ? "&" : "?"}filter=${filter}`;
    }

    // Define the authorization token
    const authToken = `Bearer ${google_access_token}`;

    // Make the API call
    try {
        const response = await axios.post(endpoint, {}, {
            headers: {
                Authorization: authToken,
                "Content-Type": "application/json",
                Accept: "application/json",
                "Accept-Charset": "utf-8",
            },
        });
        // console.log("Notes Listed successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error while listing notes from Google Keep:", (error as AxiosError)?.response?.data);
        // throw error;
    }
}