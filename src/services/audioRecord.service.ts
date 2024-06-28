import { openAITranscriptVoice } from "../services/openAI.services";
import { 
  existsSync, 
  mkdirSync, 
  unlinkSync, 
  createReadStream, 
  writeFileSync 
} from "fs";
import path from "path";
import { RequestError } from "../utils/globalErrorHandler";

export const DEFAULT_SPEECH_TO_SPEECH_MODEL = "whisper-1"

export const processuploadAudioRecord = async (userId:string, buffer:Buffer, originalname:string ) => {

  // Setup directory for temp files
  const TEMP_AUDIO_DIRECTORY_NAME = "speech-to-text-temp-files";
  const directoryPath = path.resolve(TEMP_AUDIO_DIRECTORY_NAME);
  if (!existsSync(directoryPath)) {
    // If the directory doesn't exist, create it
    mkdirSync(directoryPath);
    // console.log(`Directory '${TEMP_AUDIO_DIRECTORY_NAME}' created successfully.`);
  }
  
  const fileName = `${userId}.${originalname}`;
  const filePath = path.join(directoryPath, fileName);

  try {
    writeFileSync(filePath, buffer);
    const data = await openAITranscriptVoice({
      model: DEFAULT_SPEECH_TO_SPEECH_MODEL,
      file: createReadStream(filePath),
    });
    
    return [data];
 
  } catch (error) {
    console.error(error);
    throw new RequestError(
      "Something went wrong while speech transcription",
      500
    )
  } finally {
    // console.log("Removing temp file")
    unlinkSync(filePath);
  }

};
