import { existsSync, mkdirSync, unlinkSync } from "fs";
import { readFile, readdir } from "fs/promises";
import { extractFrames } from "../../../lib/f-ffmpeg.service";
import { User } from "../../../models/user.model";
import {
    VIDEO_TO_TEXT_DEFAULT_COMMAND,
    VIDEO_TO_TEXT_DEFAULT_FRAMERATE,
    openAICreateChatCompletionForVideoToText,
} from "../../openAI.services";
import path from "path";
import { ChatCompletionContentPartImage } from "openai/resources";
// const ffmpeg = require('fluent-ffmpeg');
import ffmpeg, { FfprobeData } from "fluent-ffmpeg";
import ytdl from "ytdl-core";
import * as fs from "fs";
import * as tmp from "tmp-promise";

const MAX_TOKENS_PER_BATCH = 300000; // Adjust this value based on your needs
const AVERAGE_TOKENS_PER_FRAME = 2000; // Estimated tokens per frame (adjust based on experience)

async function getVideoDuration(videoURL: string): Promise<number> {
    return new Promise((resolve, reject) => {
        const stream = ytdl(videoURL, { quality: 'highestvideo' });
        const tmpFilePath = path.join(__dirname, 'temp_video_file');
        
        // Write the stream to a temporary file
        const writeStream = fs.createWriteStream(tmpFilePath);
        stream.pipe(writeStream);
        
        writeStream.on('finish', () => {
            ffmpeg.ffprobe(tmpFilePath, (err: Error | null, metadata: FfprobeData) => {
                if (err) {
                    reject(err);
                } else {
                    const duration = metadata.format.duration;
                    if (duration !== undefined) {
                        resolve(duration);
                    } else {
                        reject(new Error('Unable to retrieve video duration'));
                    }
                }
                // Clean up temporary file
                unlinkSync(tmpFilePath);
            });
        });

        writeStream.on('error', (err) => {
            reject(err);
            // Clean up temporary file in case of error
            unlinkSync(tmpFilePath);
        });
    });
}

export async function videoInterpreterFunction({
    user,
    command = VIDEO_TO_TEXT_DEFAULT_COMMAND,
    frameRate = VIDEO_TO_TEXT_DEFAULT_FRAMERATE,
    videoURL,
}: {
    user: User;
    command: string;
    frameRate: number;
    videoURL: string;
}) {
    if (!user) return "Please provide user";
    if (!videoURL) return "Please provide a valid video URL";

    const { id: userId } = user;

    // Check video duration
    try {
        const duration = await getVideoDuration(videoURL);
        if (duration > 115) {
            return "The video length exceeds the 115-second limit.";
        }
    } catch (error: any) {
        return `Error getting video duration: ${error.message}`;
    }

    const FRAMES_DIRECTORY_NAME = `video-to-text-temp-frames/${userId}`;
    const directoryPath = path.resolve(FRAMES_DIRECTORY_NAME);
    if (!existsSync(directoryPath)) {
        // If the directory doesn't exist, create it
        mkdirSync(directoryPath, { recursive: true });
    }

    const framesPath = path.join(directoryPath);
    await extractFrames(videoURL, framesPath, frameRate);

    const base64Images: string[] = [];
    const files = await readdir(framesPath);

    for (const file of files) {
        const base64Data = await readFile(path.join(framesPath, file), "base64");
        base64Images.push(base64Data);
    }

    let videoDescription = "";

    try {
        const batchSize = Math.floor(MAX_TOKENS_PER_BATCH / AVERAGE_TOKENS_PER_FRAME);

        for (let i = 0; i < base64Images.length; i += batchSize) {
            const batch = base64Images.slice(i, i + batchSize);
            const base64Payload: ChatCompletionContentPartImage[] = batch.map(
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

            for await (const chunk of response) {
                videoDescription += chunk.choices[0]?.delta?.content || "";
            }
        }

        return videoDescription;
    } catch (error: any) {
        return error?.message;
    } finally {
        files.forEach((file) => {
            const filePath = path.join(directoryPath, file);
            unlinkSync(filePath);
        });
    }
}
