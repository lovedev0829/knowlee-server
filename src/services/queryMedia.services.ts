import { defaultPlayHTVoice } from "../models/userSetting.modal";
import {
  CreateAudioResponse,
  CreateImageResponse,
  CreateVideoResponse,
  GetAudioResponse,
  GetImageResponse,
  GetVideoRender,
  GetVideoResponse,
  VideoRenderParams
} from "../types/queryMedia";

const PLAY_HT_API_KEY = process.env.PLAY_HT_KEY as string;
const PLAY_HT_USER_ID = process.env.PLAY_HT_USER_ID as string;
const PLAY_HT_VOICE = process.env.PLAY_HT_VOICE as string;
const PLAY_HT_API_URL = process.env.PLAY_HT_API_URL as string;
const OMNIINFER_KEY = process.env.OMNIINFER_KEY as string;
const PICTORY_CLIENT_ID = process.env.PICTORY_CLIENT_ID as string;

const openAIApiKey = process.env.OPENAI_APIKEY as string;

export const createAudio = async (prompt: string, voice: string = defaultPlayHTVoice) => {
  try {
    // const openAIResponse = await fetch(
    //   `https://api.openai.com/v1/chat/completions`,
    //   {
    //     method: "POST",
    //     headers: {
    //       "content-type": "application/json",
    //       authorization: `Bearer ${openAIApiKey}`,
    //     },
    //     body: JSON.stringify({
    //       model: "gpt-4",
    //       max_tokens: 3000,
    //       temperature: 0.8,
    //       messages: [{ role: "assistant", content: prompt }],
    //     }),
    //   }
    // );

    // const openAIResponseJSON = await openAIResponse.json();
    // const textToVoice = openAIResponseJSON.choices[0].message;
    // //console.log("TEXTO TO VOZ:", textToVoice);

    const url = `${PLAY_HT_API_URL}/convert`;
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        AUTHORIZATION: PLAY_HT_API_KEY,
        "X-USER-ID": PLAY_HT_USER_ID,
      },
      body: JSON.stringify({
        // content: [textToVoice.content],
        content: [prompt],
        voice: voice,
      }),
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(await response.text());
    }
    const responseJSON: CreateAudioResponse = await response.json();

    // Return id from audio generated
    return responseJSON.transcriptionId;
  } catch (error) {
    //console.log(error);
    throw new Error("Error while creating audio");
  }
};

export const getAudio = async (audioId: string) => {
  const url = `${PLAY_HT_API_URL}/articleStatus?transcriptionId=${audioId}`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      AUTHORIZATION: PLAY_HT_API_KEY,
      "X-USER-ID": PLAY_HT_USER_ID,
    },
  };

  return new Promise<string>((resolve, reject) => {
    let timeElapsed = 0;
    const intervalTime = 1000;
    const timeout = 15;

    const interval = setInterval(async () => {
      timeElapsed += intervalTime / 1000;
      if (timeElapsed > timeout) {
        clearInterval(interval);
        reject(new Error("Timeout reached"));
        return;
      }

      try {
        const response = await fetch(url, options);
        const responseJSON: GetAudioResponse = await response.json();
        const audioUrl = responseJSON.audioUrl;

        if (audioUrl) {
          clearInterval(interval);
          resolve(audioUrl);
          return;
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
        return;
      }
    }, intervalTime);
  });
};

export const createImage = async ({
  prompt,
  negative_prompt,
}: {
  prompt: string;
  negative_prompt?: string;
}) => {
  const API_URL = "https://api.omniinfer.io/v2/txt2img";
  try {
    const CONFIG = {
      method: "POST",
      headers: {
        "X-Omni-Key": `${OMNIINFER_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        height: 1024,
        width: 1024,
        model_name: "sd_xl_base_1.0.safetensors",
        // model_name: "copaxTimelessxlSDXL1_colorfulV2_100729.safetensors"
        negative_prompt: negative_prompt,
      }),
    };

    const response = await fetch(API_URL, CONFIG);
    const responseJSON: CreateImageResponse = await response.json();

    // Return id from image generated
    return responseJSON?.data?.task_id;
  } catch (error) {
    //console.log("createImage error:", error);
    throw new Error("Error while creating image");
  }
};

export const getImage = async (task_id: string) => {
  const API_URL = `https://api.omniinfer.io/v2/progress?task_id=${task_id}`;
  const CONFIG = {
    method: "GET",
    headers: {
      "X-Omni-Key": `${OMNIINFER_KEY}`,
    },
  };

  return new Promise<string>((resolve, reject) => {
    let timeElapsed = 0;
    const intervalTime = 1000;
    const timeout = 15;

    const interval = setInterval(async () => {
      timeElapsed += intervalTime / 1000;
      if (timeElapsed > timeout) {
        clearInterval(interval);
        reject(new Error("Timeout reached"));
        return;
      }

      try {
        const response = await fetch(API_URL, CONFIG);
        const responseJSON: GetImageResponse = await response.json();

        if (
          responseJSON.data &&
          responseJSON.data.imgs &&
          responseJSON.data.imgs[0]
        ) {
          clearInterval(interval);
          resolve(responseJSON.data.imgs[0]);
          return;
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
        return;
      }
    }, intervalTime);
  });
};

export const createVideo = async (prompt: string, token: string) => {
  const url = "https://api.pictory.ai/pictoryapis/v1/video/storyboard";

  try {
    const raw = {
      videoName: `${prompt}`,
      videoDescription: `${prompt}`,
      language: "en",
      audio: {
        autoBackgroundMusic: true,
        backGroundMusicVolume: 0.5,
        aiVoiceOver: {
          speaker: "Jackson",
          speed: 100,
          amplifyLevel: 0,
        },
      },
      scenes: [
        {
          text: `${prompt}`,
          voiceOver: true,
          splitTextOnNewLine: false,
          splitTextOnPeriod: true,
        },
      ],
    };

    const config = {
      method: "POST",
      headers: {
        Authorization: `${token}`,
        "X-Pictory-User-Id": `${PICTORY_CLIENT_ID}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(raw),
    };

    const response = await fetch(url, config);

    const responseJSON: CreateVideoResponse = await response.json();

    return responseJSON.jobId;
  } catch (error) {
    throw new Error("Error while creating video");
  }
};

export const getVideoPreview = async (videoId: string, token: string) => {
  const API_URL = `https://api.pictory.ai/pictoryapis/v1/jobs/${videoId}`;

  let elapsedIntervals = 0;
  const intervalTime = 1000 * 3; // in milliseconds
  const maxIntervals = 7;

  const config = {
    method: "GET",
    headers: {
      Authorization: `${token}`,
      "X-Pictory-User-Id": `${PICTORY_CLIENT_ID}`,
      "Content-Type": "application/json",
    },
  };

  return new Promise<VideoRenderParams | null>((resolve, reject) => {
    const videoInterval = setInterval(async () => {
      elapsedIntervals += 1;

      if (elapsedIntervals >= maxIntervals) {
        clearInterval(videoInterval);
        reject("The search time has run out");
      }

      try {
        const response = await fetch(API_URL, config);
        const responseJSON: GetVideoResponse = await response.json();
        const renderParams = responseJSON?.data?.renderParams;

        if (renderParams) {
          clearInterval(videoInterval);
          resolve(renderParams);
          return;
        }

      } catch (error) {
        clearInterval(videoInterval);
        reject(error);
      }
    }, intervalTime);
  });
};

export const getVideoRender = async (videoId: string, token: string) => {
  const url = `https://api.pictory.ai/pictoryapis/v1/jobs/${videoId}`;
  let elapsedIntervals = 0;
  const intervalTime = 1000 * 60; // in milliseconds
  const maxIntervals = 5;

  const config = {
    method: "GET",
    headers: {
      Authorization: `${token}`,
      "X-Pictory-User-Id": `${PICTORY_CLIENT_ID}`,
      "Content-Type": "application/json",
    },
  };

  return new Promise<GetVideoRender | null>((resolve, reject) => {
    const videoInterval = setInterval(async () => {
      elapsedIntervals += 1;

      if (elapsedIntervals >= maxIntervals) {
        clearInterval(videoInterval);
        reject("The search time has run out");
      }

      try {
        const response = await fetch(url, config);
        const responseJSON: GetVideoRender = await response.json();

        if (responseJSON?.data?.status === "completed") {
          clearInterval(videoInterval);
          resolve(responseJSON);
          return;
        }

      } catch (error) {
        clearInterval(videoInterval);
        reject(error);
      }
    }, intervalTime);
  });
};