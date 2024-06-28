import { Request, Response } from "express";
import { 
    createAudio, 
    createImage, 
    createVideo, 
    getAudio, 
    getImage, 
    getVideoPreview, 
    getVideoRender 
} from "../services/queryMedia.services";
import { RequestError } from "../utils/globalErrorHandler";
import { generatePictoryToken } from "../utils/generatePictoryToken";
import { renderVideo } from "../utils/renderVideo";
import { addNewQueryQuestionToConversation } from "../services/conversation.services";
import { PANEL_OPTIONS } from "../models/queryQuestion.model";
import FormData from "form-data";
import { sendResponse } from "../utils/response.utils";
import { AxiosError } from "axios";
import { getUserSetting } from "../services/userSetting.service";
import { 
    VIDEO_TO_TEXT_DEFAULT_COMMAND, 
    VIDEO_TO_TEXT_DEFAULT_FRAMERATE, 
    DEFAULT_INSTRUCTION_FOR_SPEECH_TO_SPEECH, 
    DEFAULT_SPEECH_TO_SPEECH_MODEL, 
    DEFAULT_VOICEOVER_MODEL, 
    DEFAULT_VOICEOVER_VOICE,
    openAICreateChatCompletion, 
    openAICreateChatCompletionForVideoToText, 
    openAIGPT4VChatCompletionsCreate, 
    openAIImagesGenerate, 
    openAIGenerateVoiceOver, 
    openAITranscriptVoice 
} from "../services/openAI.services";
import { 
    ChatCompletionContentPart, 
    ChatCompletionContentPartImage 
} from "openai/resources";
import { checkUserTokenUsage } from "../utils/openAITokenUsage";
import { findOneAndUpdateUserUsageStatDocument } from "../services/userUsageStat.services";
import { extractFrames } from "../lib/f-ffmpeg.service";
import path from "path";
import { readFile, readdir } from "fs/promises";
import { 
    existsSync, 
    mkdirSync, 
    unlinkSync, 
    createReadStream, 
    readFileSync, 
    writeFileSync 
} from "fs";
import { SpeechCreateParams } from "openai/resources/audio/speech";
import { UpdateQuery } from "mongoose";
import { IUserUsageStat } from "../models/UserUsageStat.model";
import { findOneStatsPriceDocument } from "../services/stripe/statsPrice.services";


const openAITranscriptionModel = "whisper-1";

export const generateImage = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const userId = user.id;
  const { prompt, conversationId, negative_prompt, textToImageModel } = req.body;
  if (!prompt) throw new RequestError("Invalid/Empty query", 400);
  if (!conversationId) throw new RequestError("ConversationId is required", 400);

  try {

    if (textToImageModel === "DALLE") {
      const image = await openAIImagesGenerate({ prompt });
      const imageUrl = image.data[0]?.url;

      // increment textToImage dalle3 usage count
      const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
        { userId: userId },
        { $inc: { "textToImage.dalle3Count": 1 } },
        { upsert: true, new: true }
      );

      // store in queryQuestion
      await addNewQueryQuestionToConversation(conversationId, {
        question: prompt,
        type: PANEL_OPTIONS.IMAGE,
        data: { imageUrl: imageUrl },
      });

      return res.status(201).json({
        imageUrl: imageUrl,
      });
    }

    const imageId = await createImage({ negative_prompt, prompt });

    // Waiting for image exists in the server
    await new Promise((resolve) => setTimeout(resolve, 10000));

    const imageUrl = await getImage(imageId);

    // increment textToImage sdxl usage count
    const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
      { userId: userId },
      { $inc: { "textToImage.sdxlCount": 1 } },
      { upsert: true, new: true }
    );

    // store in queryQuestion
    await addNewQueryQuestionToConversation(conversationId, {
      question: prompt,
      type: PANEL_OPTIONS.IMAGE,
      data: { imageUrl: imageUrl },
    });

    return res.status(201).json({
      imageUrl: imageUrl,
    });
    
  } catch (error) {
    throw new RequestError(
      "Something went wrong while generating image",
      500
    )
  }
}

export const generateAudio = async (req: Request, res: Response) => { 
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const userId = user.id;
  const { prompt, conversationId } = req.body;
  if (!prompt) throw new RequestError("Invalid/Empty query", 400);
  if (!conversationId) throw new RequestError("ConversationId is required", 400);

  try {
    const userSetting = await getUserSetting(userId);

    // const audioId: string = await createAudio(
    //   prompt,
    //   userSetting?.textToAudioSetting.voice
    // );

    const audioId: string = await createAudio(prompt);

    // increment textToAudio usage count
    const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
      { userId: userId },
      { $inc: { "textToAudioCount": 1 } },
      { upsert: true, new: true }
    );

    // Waiting for audio exists in the server
    await new Promise(resolve => setTimeout(resolve, 1500));

    const audioUrl = await getAudio(audioId);

    // store in queryQuestion
    await addNewQueryQuestionToConversation(conversationId, {
      question: prompt,
      type: PANEL_OPTIONS.AUDIO,
      data: {
        audioUrl: audioUrl,
      },
    });

    return res.status(201).json({
      audioUrl: audioUrl,
    });

  } catch (error) {
    console.error(error);
    throw new RequestError(
      "Something went wrong while generating audio",
      500
    )
  }
}


export const  generateVideoPreview = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const userId = user.id;

  const { prompt, conversationId } = req.body;
  if (!prompt) throw new RequestError("Invalid/Empty query", 400);
  if (!conversationId) throw new RequestError("ConversationId is required", 400);

  try {
    const pictoryToken = await generatePictoryToken();

    const videoId = await createVideo(prompt, pictoryToken);

    // increment textToVideo usage count
    const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
      { userId: userId },
      { $inc: { "textToVideoCount": 1 } },
      { upsert: true, new: true }
    );

    const videoRenderParams = await getVideoPreview(videoId, pictoryToken);

    if (!videoRenderParams) {
      throw new Error("videoRenderParams not found");
    }

    const videoPreviewUrl = videoRenderParams.scenes[0].background.src[0].url;

    const { audio, output, scenes } = videoRenderParams;

    // store in queryQuestion
    await addNewQueryQuestionToConversation(conversationId, {
      question: prompt,
      type: PANEL_OPTIONS.VIDEO,
      data: {
        videoRenderParams: {
          audio,
          output,
          scenes
        },
        videoUrl: videoPreviewUrl
      },
    });

    return res.status(201).json({
      videoRenderParams: {
        audio,
        output,
        scenes
      },
      videoUrl: videoPreviewUrl
    });

  } catch (error) {
    throw new RequestError(
      "Something went wrong while generating video preview",
      500
    )
  }
}

export const generateVideoRender = async (req: Request, res: Response) => {
  const { audio, output, scenes } = req.body;
  if (!audio || !output || !scenes) throw new RequestError("Invalid/Empty query", 400);

  try {
    const pictoryToken = await generatePictoryToken();

    const getRender = await renderVideo({
      audio: audio,
      output: output,
      scenes: scenes,
      client_token: pictoryToken
    })

    const videoId = getRender?.data?.job_id;

    const videoRender = await getVideoRender(videoId, pictoryToken);
    const videoRenderUrl = videoRender?.data.videoURL;

    return res.status(201).json({
      videoUrl: videoRenderUrl
    });

  } catch (error) {
    throw new RequestError(
      "Something went wrong while generating video render",
      500
    )
  }
}

export const speechToTextController = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const userId = user.id;
  const file = req.file;
  if (!file) throw new RequestError("file is required", 400);


  // Setup directory for temp files
  const TEMP_AUDIO_DIRECTORY_NAME = "speech-to-text-temp-files";
  const directoryPath = path.resolve(TEMP_AUDIO_DIRECTORY_NAME);
  if (!existsSync(directoryPath)) {
    // If the directory doesn't exist, create it
    mkdirSync(directoryPath, { recursive: true });
    //console.log(`Directory '${TEMP_AUDIO_DIRECTORY_NAME}' created successfully.`);
  }
  
  const audioData = file.buffer;
  const fileName = `${user.id}.${file.originalname}`;
  const filePath = path.join(directoryPath, fileName);

  try {
    writeFileSync(filePath, audioData);
    const data = await openAITranscriptVoice({
      model: DEFAULT_SPEECH_TO_SPEECH_MODEL,
      file: createReadStream(filePath),
    });

    // increment speechToText usage count
    const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
      { userId: userId },
      { $inc: { "speechToTextCount": 1 } },
      { upsert: true, new: true }
    );

    return sendResponse(res, 200, "", data);
  } catch (error) {
    console.error(error);
    throw new RequestError(
      "Something went wrong while speech transcription",
      500
    )
  } finally {
    //console.log("Removing temp file")
    unlinkSync(filePath);
  }
}

export const imageInterpreterController = async (
  req: Request,
  res: Response
) => {

  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);

  const { prompt, image_url, conversationId } = req.body;
  if (!prompt) throw new RequestError("prompt is required", 400);
  if (!conversationId) {
    throw new RequestError("conversationId is required", 400);
  }
  const imageFiles = req.files as Express.Multer.File[]
  
  if (!image_url && !imageFiles.length) throw new RequestError("Please pass image url or upload your local images", 400);
  
  let base64Images = []

  if(imageFiles && imageFiles.length) {
    base64Images = imageFiles.map((file: any) => file.buffer.toString('base64'))
  }

  await checkUserTokenUsage(user.id);

  const content: ChatCompletionContentPart[] = [
    { type: "text", text: prompt },
  ];

  if(image_url) {
    content.push({
      type: "image_url",
      image_url: {
        url: image_url,
        detail: "auto",
      },
    })
  } 
  
  if(base64Images.length) {
    const messageContent = base64Images.map(image_url => ({
      type: "image_url",
      image_url: {
        url: `data:image/jpeg;base64,${image_url}`,
        detail: "auto",
      }
    } as const))
    content.push(...messageContent)
  }

  const completion = await openAIGPT4VChatCompletionsCreate(content);

  // update user token usage
  const total_tokens = completion.usage?.total_tokens ?? 0;

  const updateObject: UpdateQuery<IUserUsageStat> = { $inc: {} };
  updateObject.$inc["tokenUsed"] = total_tokens || 0;
  if (req?.useCredit) {
      // find stats price document
      const statsPrice = await findOneStatsPriceDocument({});
      const { unitCost = 0, perUnit = 1 } = statsPrice?.features?.tokens || {};
      const creditUsed = (unitCost / perUnit) * total_tokens;
      updateObject.$inc["credit.used"] = creditUsed || 0;
  }

  const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
    { userId: user.id },
    updateObject,
    { upsert: true, new: true }
  );

  // update imageInterpretation count
  await findOneAndUpdateUserUsageStatDocument(
    { userId: user.id },
    { $inc: { "imageInterpretationCount": 1 } },
    { upsert: true, new: true }
  );

  const messageContent = completion.choices[0].message.content;
  if (!messageContent) throw new Error("ChatGPT response failed");

  // store in queryQuestion
  await addNewQueryQuestionToConversation(conversationId, {
    question: prompt,
    type: PANEL_OPTIONS.IMAGE_INTERPRETER,
    answer: messageContent,
    data: {
      image_url: image_url,
    },
  });
  return sendResponse(res, 200, "success", { messageContent: messageContent });
};


export const videoToTextController = async (req: Request, res: Response) => {
  interface ChunkType {
    // Define the properties of ChunkType here
    choices: Array<{
      delta?: {
        content?: string;
      };
    }>;
  }

  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  let { videoURL, command, frameRate } = req.body;
  if (!command) {
    command = VIDEO_TO_TEXT_DEFAULT_COMMAND;
  }

  if (!frameRate) {
    frameRate = VIDEO_TO_TEXT_DEFAULT_FRAMERATE;
  }

  if (!videoURL)
    throw new RequestError("Please provide a valid video URL", 400);

  const videoPath = videoURL;

  const FRAMES_DIRECTORY_NAME = `video-to-text-temp-frames/${user.id.toString()}`;
  const directoryPath = path.resolve(FRAMES_DIRECTORY_NAME);
  if (!existsSync(directoryPath)) {
    // If the directory doesn't exist, create it
    mkdirSync(directoryPath, { recursive: true });
    //console.log(`Directory '${FRAMES_DIRECTORY_NAME}' created successfully.`);
  }

  const framesPath = path.join(directoryPath);

  await extractFrames(videoPath, framesPath, frameRate);

  const base64Images: string[] = [];
  const files = await readdir(framesPath);

  try {
    for (const file of files) {
      const base64Data = await readFile(path.join(framesPath, file), "base64");
      base64Images.push(base64Data);
    }

    const base64Payload: ChatCompletionContentPartImage[] = base64Images.map(
      (image) => ({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${image}`,
          detail: "high",
        },
      })
    );
    const response = await openAICreateChatCompletionForVideoToText({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: command,
            },
            ...base64Payload,
          ],
        },
      ],
    });


    // update user token usage
  // const total_tokens = response.usage?.total_tokens ?? 0;
  // const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
  //   { userId: user.id },
  //   { $inc: { "tokenUsed": total_tokens } },
  //   { upsert: true, new: true }
  // );

    let videoDescription = ``;
    const chunks = []
    for await (const chunk of response) {
      chunks.push(chunk)
      // Read and process the stream data
      // process.stdout.write(chunk.choices[0]?.delta?.content || "");
    }
  
    chunks.forEach((chunk) =>  videoDescription = `${videoDescription}${chunk.choices[0]?.delta?.content || ""}`)

    return sendResponse(res, 200, "success", {
      messageContent: videoDescription,
    });
  } catch (error) {
    //console.log(error);
    throw new RequestError(
      "Something went wrong while interpreting video",
      500
    )
  } finally {
    //console.log("Deleted generated frames from ", FRAMES_DIRECTORY_NAME);
    files.forEach((file) => {
      const filePath = path.join(directoryPath, file);
      unlinkSync(filePath);
    });
  }
}

export const textToSpeechController = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);

  const { text } = req.body;
  if (!text) throw new RequestError("text is required", 400);

  await checkUserTokenUsage(user.id);

  const userSetting = await getUserSetting(user.id);
  const openAiVoice = userSetting?.textToAudioSetting?.voice ?? DEFAULT_VOICEOVER_VOICE;

  const mp3 = await openAIGenerateVoiceOver({
    input: text,
    model: DEFAULT_VOICEOVER_MODEL,
    voice: openAiVoice as SpeechCreateParams["voice"],
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());
  // writeFileSync("voiceover.mp3", buffer);

  return sendResponse(res, 200, "success", buffer);
};

export const speechToSpeechController = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);

  const { instructions } = req.body;
  const file = req.file;

  if (!file) throw new RequestError("file is required", 400);

  // Check for token usage
  await checkUserTokenUsage(user.id);

  // Setup directory for temp files
  const TEMP_AUDIO_DIRECTORY_NAME = "speech-to-speech-temp-files";
  const directoryPath = path.resolve(TEMP_AUDIO_DIRECTORY_NAME);
  if (!existsSync(directoryPath)) {
    // If the directory doesn't exist, create it
    mkdirSync(directoryPath, { recursive: true });
    //console.log(`Directory '${TEMP_AUDIO_DIRECTORY_NAME}' created successfully.`);
  }
  
  const audioData = file.buffer;
  const fileName = `${user.id}.${file.originalname}`;
  const filePath = path.join(directoryPath, fileName);

  try {
    writeFileSync(filePath, audioData);

    // SPEECH => TEXT
    const transcript = await openAITranscriptVoice({
      model: DEFAULT_SPEECH_TO_SPEECH_MODEL,
      file: createReadStream(filePath),
    });
  
    // QUESTION => ANSWER
    const userQuery = await openAICreateChatCompletion({
      messages: [
        {
          role: "user",
          content: instructions || DEFAULT_INSTRUCTION_FOR_SPEECH_TO_SPEECH,
        },
        {
          role: "user",
          content: transcript.text,
        },
      ],
    });

    const openAIResponse = userQuery.choices[0]?.message?.content;

    if (!openAIResponse) throw new Error("Could not get response from openAI");

    // ANSWER => AUDIO
    const mp3 = await openAIGenerateVoiceOver({
      input: openAIResponse,
      model: DEFAULT_VOICEOVER_MODEL,
      voice: DEFAULT_VOICEOVER_VOICE,
    });
  
    // update user token usage
    const total_tokens = userQuery.usage?.total_tokens ?? 0;
    const updateObject: UpdateQuery<IUserUsageStat> = {
      $inc: {
        tokenUsed: total_tokens,
        textToAudioCount: 1,
        speechToTextCount: 1,
      },
    };
    if (req.useCredit) {
      // find stats price document
      const statsPrice = await findOneStatsPriceDocument({});
      const { unitCost = 0, perUnit = 1 } = statsPrice?.features?.tokens || {};
      const creditUsed = (unitCost / perUnit) * total_tokens;
      updateObject.$inc["credit.used"] = creditUsed || 0;
    }
    const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
      { userId: user.id },
      updateObject,
      { upsert: true, new: true }
    );

    const buffer = Buffer.from(await mp3.arrayBuffer());
    return sendResponse(res, 200, "success", buffer);
  } catch (error) {
    console.error(error);
    throw new RequestError("Something went wrong while understanding speech", 500)
  } finally {
    //console.log("Removing temp file")
    unlinkSync(filePath);

  }
};
