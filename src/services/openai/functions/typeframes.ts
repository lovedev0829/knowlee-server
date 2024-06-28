import axios from "axios";
import { User } from "../../../models/user.model";

const TYPEFRAMES_BASE_URL = "https://www.typeframes.com";
const TYPEFRAMES_API_KEY = process.env.TYPEFRAMES_API_KEY;

async function sendRequestToTypeframes(endpoint: string, payload: any) {
    try {
        const res = await axios.post(
            `${TYPEFRAMES_BASE_URL}${endpoint}`,
            payload,
            {
                headers: {
                    key: TYPEFRAMES_API_KEY,
                },
            }
        );
        //console.log("res.data----->", res.data);
        return res.data;
    } catch (error: any) {
        const errorMessage = error.response ? error.response.data : error.message;
        //console.log(`Error: ${errorMessage}`);
        return { success: 0, error: errorMessage };
    }
}

export async function typeframesCreateVideoFunction({
    user,
    text,
    speed,
    audio,
    compression,
    frameDurationMultiplier,
    resolution,
    width,
    height,
    frameRate,
    hasToGenerateVoice,
    hasToSearchMedia,
}: {
    user: User;
    text: string;
    speed?: "fast" | "medium" | "slow";
    audio?: string;
    compression?: "low" | "medium" | "high";
    frameDurationMultiplier?: number;
    resolution?: string;
    width?: string;
    height?: string;
    frameRate?: number;
    hasToGenerateVoice?: boolean;
    hasToSearchMedia?: boolean;
}) {
    const payload = {
        text,
        speed,
        audio,
        compression,
        frameDurationMultiplier,
        resolution,
        width,
        height,
        frameRate,
        hasToGenerateVoice,
        hasToSearchMedia,
    };

    return await sendRequestToTypeframes("/api/public/render", payload);
}

export async function typeframesCreateVideoFromTextFunction({
    user,
    text,
    speed = "fast",
    audio = "dont-blink",
    compression = "medium",
    frameDurationMultiplier,
    resolution = "720p",
    width = "1280",
    height = "720",
    frameRate = 60,
}: {
    user: User;
    text: string;
    speed?: "fast" | "medium" | "slow";
    audio?: string;
    compression?: "low" | "medium" | "high";
    frameDurationMultiplier?: number;
    resolution?: string;
    width?: string;
    height?: string;
    frameRate?: number;
}) {
    const payload = {
        text,
        speed,
        audio,
        compression,
        frameDurationMultiplier,
        resolution,
        width,
        height,
        frameRate,
    };

    return await sendRequestToTypeframes("/api/public/render", payload);
}

export async function typeframesCreateVideoFromSlidesFunction({
    user,
    slides,
    speed = "fast",
    audio = "dont-blink",
    compression = "medium",
    frameDurationMultiplier,
    resolution = "720p",
    width = "1280",
    height = "720",
    frameRate = 60,
}: {
    user: User;
    slides: Array<any>;
    speed?: "fast" | "medium" | "slow";
    audio?: string;
    compression?: "low" | "medium" | "high";
    frameDurationMultiplier?: number;
    resolution?: string;
    width?: string;
    height?: string;
    frameRate?: number;
}) {
    const payload = {
        slides,
        speed,
        audio,
        compression,
        frameDurationMultiplier,
        resolution,
        width,
        height,
        frameRate,
    };

    return await sendRequestToTypeframes("/api/public/render", payload);
}

export async function typeframesCreateVideoFromUrlFunction({
    user,
    url,
    speed = "fast",
    audio = "dont-blink",
    compression = "medium",
    frameDurationMultiplier,
    resolution = "720p",
    width = "1280",
    height = "720",
    frameRate = 60,
}: {
    user: User;
    url: string;
    speed?: "fast" | "medium" | "slow";
    audio?: string;
    compression?: "low" | "medium" | "high";
    frameDurationMultiplier?: number;
    resolution?: string;
    width?: string;
    height?: string;
    frameRate?: number;
}) {
    const payload = {
        url,
        speed,
        audio,
        compression,
        frameDurationMultiplier,
        resolution,
        width,
        height,
        frameRate,
    };

    return await sendRequestToTypeframes("/api/public/render", payload);
}

export async function typeframesGPTGetVideosFunction({
    user,
    query,
}: {
    user: User;
    query: string;
}) {
    try {
        const res = await axios.get(
            `${TYPEFRAMES_BASE_URL}/api/public/video/search`,
            {
                headers: {
                    key: TYPEFRAMES_API_KEY,
                },
                params: {
                    query: query,
                },
            }
        );
        //console.log("res.data----->", res.data);
        return res.data;
    } catch (error: any) {
        const errorMessage = error.response ? error.response.data : error.message;
        //console.log("Error searching video using typeframes:----->", errorMessage);
        return { success: 0, error: errorMessage };
    }
}

export async function typeframesCreateSlidesFunction({
    user,
    text,
    audio,
}: {
    user: User;
    text: string;
    audio?: string;
}) {
    const payload: any = {
        text,
    };

    if (audio) payload.audio = audio;

    return await sendRequestToTypeframes("/api/public/slides", payload);
}
