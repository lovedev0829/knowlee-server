import axios from "axios";
import { User } from "../../../models/user.model";
import { KlapExportedClip, KlapVideo, KlapVideoClip } from "../../../types/klap.types";

const KLAP_API_KEY = process.env.KLAP_API_KEY;
const KLAP_API_URL = "https://v1.api.klap.app/v1";

export type KlapCreateVideoClipPayload = {
    source_video_url: string;
    language: string;
    min_duration: number;
    max_duration: number;
    target_duration: number;
};

const getAuthHeaders = async () => {
    if (!KLAP_API_KEY) {
        throw new Error("KLAP API key is missing");
    }
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KLAP_API_KEY}`,
    };
};

const postRequest = async (url: string, body = {}, sync: boolean = false) => {
    try {
        const fullUrl = `${KLAP_API_URL}${url}${sync ? '?sync=true' : ''}`;
        const response = await axios.post(fullUrl, body, {
            headers: await getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Post request to ${url} failed: ${error.response?.data.message || error.message}`);
        }
        throw error;
    }
};

const getRequest = async (url: string) => {
    try {
        const response = await axios.get(`${KLAP_API_URL}${url}`, {
            headers: await getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Get request to ${url} failed: ${error.response?.data.message || error.message}`);
        }
        throw error;
    }
};

const pollStatus = async (url: string, checkKey: string, checkValue: any) => {
    let resJson;
    try {
        do {
            resJson = await getRequest(url);
            // console.log(`[${new Date().toLocaleTimeString()}] Polling ${url} while ${checkKey} === ${checkValue}...`);
            await new Promise((r) => setTimeout(r, 30000));
        } while (resJson[checkKey] === checkValue);
        return resJson;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Polling status at ${url} failed: ${error.response?.data.message || error.message}`);
        }
        throw error;
    }
};

export const klapCreatevideoFunction = async ({
    user,
    source_video_url,
    language,
    min_duration = 10,
    max_duration = 30,
    target_duration = 15,
}: {
    user: User;
    source_video_url: string;
    language: string;
    min_duration?: number;
    max_duration?: number;
    target_duration?: number;
}) => {
    try {
        validateDurations(min_duration, max_duration, target_duration);

        let video = await postRequest("/videos", { source_video_url, language, min_duration, max_duration, target_duration }, true);
        // console.log(`Video created: ${video.id}. Processing done.`);

        if (video.status === "error") throw new Error("Video processing failed.");

        const clips = await getRequest(`/videos/${video.id}/clips`);
        // console.log(`Got ${clips.length} clips.`);
        clips.forEach((clip: any) => console.log(`"${clip.name}" Virality Score: ${clip.virality_score}`));

        const bestClip = clips[0];
        // console.log(`Exporting best clip: ${bestClip.id}...`);

        let exportRes = await postRequest(`/videos/${video.id}/clips/${bestClip.id}/exports`, {
            options: { face_recognition: true, crop: true, subtitles: true },
            preset_id: "aedb9874-db95-410f-ac0c-ee5ec29c67f7",
        }, true);

        // console.log(`Export done: ${exportRes.id}.`);
        return exportRes.src_url;
    } catch (error) {
        if (error instanceof Error) {
            // console.log("Error creating video:", error.message);
            return error.message;
        }
        // console.log("An unknown error occurred");
        return "An unknown error occurred";
    }
};

export const klapCreateVideoClipsFunction = async ({
    user,
    source_video_url,
    language,
    min_duration = 10,
    max_duration = 30,
    target_duration = 15,
}: {
    user: User;
    source_video_url: string;
    language: string;
    min_duration?: number;
    max_duration?: number;
    target_duration?: number;
}) => {
    try {
        validateDurations(min_duration, max_duration, target_duration);

        const video = await postRequest("/videos", { source_video_url, language, min_duration, max_duration, target_duration }, true);
        // console.log(`Video created: ${video.id}. Processing done.`);

        if (video.status === "error") throw new Error("Video processing failed.");

        const clips = await getRequest(`/videos/${video.id}/clips`);
        // console.log(`Got ${clips.length} clips.`);
        return clips;
    } catch (error) {
        if (error instanceof Error) {
            // console.log("Error creating video clips:", error.message);
            return error.message;
        }
        // console.log("An unknown error occurred");
        return "An unknown error occurred";
    }
};

export const klapCreateVideoFromClipFunction = async ({
    user,
    clipId,
    videoId,
}: {
    user: User;
    clipId: string;
    videoId: string;
}) => {
    try {
        const exportRes = await postRequest(`/videos/${videoId}/clips/${clipId}/exports`, {
            options: { face_recognition: true, crop: true, subtitles: true },
            preset_id: "aedb9874-db95-410f-ac0c-ee5ec29c67f7",
        }, true);

        // console.log(`Export done: ${exportRes.id}.`);
        return exportRes.src_url;
    } catch (error) {
        if (error instanceof Error) {
            // console.log("Error creating video from clip:", error.message);
            return error.message;
        }
        // console.log("An unknown error occurred");
        return "An unknown error occurred";
    }
};

const validateDurations = (min_duration: number, max_duration: number, target_duration: number) => {
    if (min_duration < 1 || min_duration > 120) {
        throw new Error("min_duration must be between 1 and 120 seconds");
    }
    if (max_duration < 1 || max_duration > 120) {
        throw new Error("max_duration must be between 1 and 120 seconds");
    }
    if (target_duration < min_duration || target_duration > max_duration) {
        throw new Error("target_duration must be between min_duration and max_duration");
    }
};
