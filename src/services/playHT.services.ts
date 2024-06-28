import fetch from "node-fetch";
import axios, { AxiosRequestConfig } from 'axios';
import FormData from 'form-data';
import { IPlayHTClonedVoice } from "../types/userSetting";

const PLAY_HT_API_KEY = process.env.PLAY_HT_KEY as string;
const PLAY_HT_API_URL = process.env.PLAY_HT_API_URL as string;
const PLAY_HT_USER_ID = process.env.PLAY_HT_USER_ID as string;

const playHTCommonHeaders = {
    accept: "application/json",
    AUTHORIZATION: PLAY_HT_API_KEY,
    "X-USER-ID": PLAY_HT_USER_ID,
}

export async function playHTGetVoices() {
    const url = `${PLAY_HT_API_URL}/getVoices`;
    const options = {
        method: "GET",
        headers: playHTCommonHeaders,
    };
    const res = await fetch(url, options)
        .then((res) => res.json())
        .catch((err) => console.error("error:" + err));
    return res;
}

export async function playHTGetClonedVoices() {
    const url = "https://play.ht/api/v2/cloned-voices";
    const options = {
        method: "GET",
        headers: playHTCommonHeaders,
    };
    const res = await fetch(url, options)
        .then((res) => res.json())
        .catch((err) => console.error("error:" + err));
    return res;
}

// Create instant voice clone (via file upload)
export async function createInstantVoiceCloneViaFileUpload(formData: FormData) {
    let config: AxiosRequestConfig = {
        method: "POST",
        maxBodyLength: Infinity,
        url: 'https://play.ht/api/v2/cloned-voices/instant',
        headers: {
            ...formData.getHeaders(),
            ...playHTCommonHeaders,
        },
        data: formData
    };

    const res = await axios.request<IPlayHTClonedVoice>(config)
    return res.data;
}
