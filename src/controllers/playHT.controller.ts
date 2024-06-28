import { AxiosError } from 'axios';
import { Request, Response } from 'express'
import FormData from 'form-data';
import { sendResponse } from '../utils/response.utils'
import {
  createInstantVoiceCloneViaFileUpload,
  playHTGetClonedVoices,
  playHTGetVoices
} from '../services/playHT.services';
import { RequestError } from '../utils/globalErrorHandler';
import { pushClonedVoiceToUserSetting } from '../services/userSetting.service';

export const playHTGetVoicesController = async (req: Request, res: Response) => {
  try {
    const data = await playHTGetVoices();
    return sendResponse(res, 200, "", data);
  } catch (error) {
    throw new RequestError("Failed to get playHT voices", 500);
  }
};

export const playHTGetClonedVoicesController = async (req: Request, res: Response) => {
  try {
    const data = await playHTGetClonedVoices();
    return sendResponse(res, 200, "", data);
  } catch (error) {
    throw new RequestError("Failed to get playHT cloned voices", 500);
  }
};

export const createInstantVoiceCloneViaFileUploadController = async (
  req: Request,
  res: Response
) => {
  // body should contain 'voice_name':string and 'sample_file':file
  const { voice_name } = req.body;
  const sample_file = req.file;
  if (!voice_name) throw new RequestError("voice_name is required", 400);
  if (!sample_file) throw new RequestError("sample_file is required", 400);
  if (!req.user) throw new RequestError("Could not verify user", 401);

  try {
    const formData = new FormData();
    formData.append("voice_name", voice_name);
    formData.append("sample_file", sample_file.buffer, {
      filename: sample_file.originalname,
    });

    const data = await createInstantVoiceCloneViaFileUpload(formData);

    // push cloned voice to userSetting 
    await pushClonedVoiceToUserSetting(req.user.id, [data])
    return sendResponse(res, 200, "", data);
  } catch (error) {
    console.error("Error:", error);
    if (error instanceof AxiosError) {
      //console.log("Error", error.message);
      if (error.response) {
        //console.log(error.response.status);
        //console.log(error.response.data);
      }
    }
    throw new RequestError(
      "Failed to create instant voice clone (via file upload)",
      500
    );
  }
};
