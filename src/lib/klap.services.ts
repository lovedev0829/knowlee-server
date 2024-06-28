// add to env or doppler
// KLAP_API_KEY="kak_0f675be1b88d-4b3a-b50b-15f50c058b47"

import axios from "axios";
import {
    KlapExportedClip,
    KlapVideo,
    KlapVideoClip,
} from "../types/klap.types";

const KLAP_API_KEY =
    process.env.KLAP_API_KEY || "kak_0f675be1b88d-4b3a-b50b-15f50c058b47";
const KLAP_API_URL = "https://api.klap.app/v1";

const defaultPresetIDs = [
    "492856e0-fddd-4fed-9c60-2bd256115baf",
    "b0728c24-ad53-4bc8-9f69-0d09f7aff0f9",
    "2698fc2a-d9a5-4294-b568-892d41ca2143",
    "2e5e4277-d535-47c2-a1c8-1b05696e1f6a",
];

export type GenerateVideoClipPayload = {
    language?: string;
    maxDuration?: number;
    sourceVideoUrl: string;
};

export async function generateClip({
    language = "en",
    maxDuration = 60,
    sourceVideoUrl,
}: GenerateVideoClipPayload) {
    let video = await postRequest("/videos", {
        language: language,
        max_duration: maxDuration,
        source_video_url: sourceVideoUrl,
    });

    // console.log(`Video created: ${video.id}. Processing...`);
    video = await pollStatus(`/videos/${video.id}`, "status", "processing");
    // console.log(`Video processing done: ${video.id}.`);

    if (video.status == "error") throw Error("Video processing failed.");

    const clips = await getRequest(`/videos/${video.id}/clips`);
    // console.log(`Got ${clips.length} clips.`);
    // clips.forEach((clip: any) =>
    //     console.log(`"${clip.name}" Virality Score: ${clip.virality_score}`)
    // );

    const bestClip = clips[0];
    // console.log(`Exporting best clip: ${bestClip.id}...`);

    let exportRes = await postRequest(
        `/videos/${video.id}/clips/${bestClip.id}/exports`,
        {
            options: { face_recognition: true, crop: true, subtitles: true },
            preset_id: "aedb9874-db95-410f-ac0c-ee5ec29c67f7",
        }
    );

    // console.log(`Export started: ${exportRes.id}.`);
    exportRes = await pollStatus(
        `/videos/${video.id}/clips/${bestClip.id}/exports/${exportRes.id}`,
        "status",
        "processing"
    );
    // console.log(`Export done: ${exportRes.id}.`);
    return exportRes.src_url;
}

const postRequest = async (url: string, body = {}) => {
    const response = await fetch(`${KLAP_API_URL}${url}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${KLAP_API_KEY}`,
        },
        body: JSON.stringify(body),
    });
    return response.ok ? response.json() : Promise.reject(await response.json());
};

const getRequest = async (url: string) => {
    const response = await fetch(`${KLAP_API_URL}${url}`, {
        headers: { Authorization: `Bearer ${KLAP_API_KEY}` },
    });
    return response.json();
};

export const pollStatus = async (
    url: string,
    checkKey: string,
    checkValue: any
) => {
    let resJson;
    do {
        resJson = await getRequest(url);
        // console.log(
        //     `[${new Date().toLocaleTimeString()}] Polling ${url} while ${checkKey} === ${checkValue}...`
        // );
        await new Promise((r) => setTimeout(r, 30000));
    } while (resJson[checkKey] === checkValue);
    return resJson;
};

export async function klapCreateVideo({
    language = "en",
    maxDuration = 60,
    sourceVideoUrl,
}: GenerateVideoClipPayload): Promise<KlapVideo> {

    // console.log("creating klap video...", {
    //     // language,
    //     // maxDuration,
    //     sourceVideoUrl,
    // });

    const response = await axios.request({
        method: "POST",
        maxBodyLength: Infinity,
        url: `${KLAP_API_URL}/videos`,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${KLAP_API_KEY}`,
        },
        data: {
            language: language,
            max_duration: maxDuration,
            source_video_url: sourceVideoUrl,
        },
        params: {
            sync: true,
        },
    });
    // console.log(JSON.stringify(response.data));

    // const res = await axios.post(
    //     `${KLAP_API_URL}/videos`,
    //     {
    //         language: language,
    //         max_duration: maxDuration,
    //         source_video_url: sourceVideoUrl,
    //     },
    //     {
    //         headers: {
    //             "Content-Type": "application/json",
    //             Authorization: `Bearer ${KLAP_API_KEY}`,
    //         },
    //         params: {
    //             sync: true,
    //         },
    //     }
    // );
    return response.data;
}

const videosRes = {
    id: "a138048d-e4b0-4112-ae68-c8d428a3634e",
    created_at: "2023-12-08T05:03:10.91362+00:00",
    youtube_vid: "Zr1D3FYcV3Y",
    status: "ready",
    title: "Thoughts on David Grusch's UFO Claims",
    description:
        "Taken from JRE #2068 w/Cam Hanes:\nhttps://open.spotify.com/episode/3y6k1Q9fgdJhZsVMXI83Rn?si=edd09d179e2e4f87",
    error_code: null,
    duration: 374,
    detected_language: "en",
    translate_to: null,
    src_url:
        "https://storage.googleapis.com/klap-video-sources/1080_a138048d-e4b0-4112-ae68-c8d428a3634e.mp4",
    src_frame_count: 11199,
    src_fps: 29.97,
    src_width: 1920,
    src_height: 1080,
    lowres_src_url:
        "https://storage.googleapis.com/klap-video-sources/360_a138048d-e4b0-4112-ae68-c8d428a3634e.mp4",
    lowres_src_fps: 29.97,
    lowres_src_frame_count: 21596,
    lowres_src_width: 854,
    lowres_src_height: 480,
};

export async function klapGetVideoClips(
    videoId: string
): Promise<KlapVideoClip[]> {
    const res = await axios.get(`${KLAP_API_URL}/videos/${videoId}/clips`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${KLAP_API_KEY}`,
        },
    });
    return res.data;
}

const videoClipsRes = [
    {
        id: "3b38db7a-ccc4-421b-9daa-4d6b1a222926",
        created_at: "2023-12-08T08:22:07.157317+00:00",
        name: "Money flow and secret programs",
        video_id: "d3031857-914f-45a3-b350-87b3f79e648b",
        virality_score: 85,
        virality_score_explanation:
            "This video has a high virality potential due to its intriguing topic of secret programs and gravity propulsion. The dialogue is fast-paced and includes elements like national security, top scientists, cool projects, and the mention of historical events like the Foo Fighters and Roswell crash. The conversation also hints at the possibility of extraterrestrial life on other planets. However, some people might find the explicit language in the video off-putting or controversial.",
        preset_id: "492856e0-fddd-4fed-9c60-2bd256115baf",
        dimensions_width: 1080,
        dimensions_height: 1920,
        duration_seconds: 52.0186333333333,
    },
];

export async function klapExportClip({
    videoId,
    clipId,
}: {
    videoId: string;
    clipId: string;
}): Promise<KlapExportedClip> {

    // console.log("exporting klap video clip...", {
    //     videoId,
    //     clipId,
    // });

    const res = await axios.post(
        `${KLAP_API_URL}/videos/${videoId}/clips/${clipId}/exports`,
        {
            options: { face_recognition: true, crop: true, subtitles: true },
            preset_id: "aedb9874-db95-410f-ac0c-ee5ec29c67f7",
        },
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${KLAP_API_KEY}`,
            },
            params: {
                sync: true,
            },
        }
    );
    return res.data;
}

const exportRes = {
    id: "f090c67b-fc15-44c4-8217-7d760564329d",
    created_at: "2023-12-08T09:19:23.021+00:00",
    clip_id: "3b38db7a-ccc4-421b-9daa-4d6b1a222926",
    video_id: "d3031857-914f-45a3-b350-87b3f79e648b",
    author_id: "da89f69d-5c11-4de4-9667-e7ec354e341f",
    name: "Money flow and secret programs",
    src_url:
        "https://storage.googleapis.com/klap-renders/0cfb5711-c65d-4f26-98bb-3b3acffd78c6-85fd92a5-3ad4-4dae-bcea-26f8cdd7d1bb.mp4",
    progress: 1,
    status: "ready",
};
