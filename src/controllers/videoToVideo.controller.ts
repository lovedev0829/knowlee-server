import { Request, Response } from "express";
import { sendResponse } from "../utils/response.utils";
import { RequestError } from "../utils/globalErrorHandler";
import {
  // generateClip,
  klapCreateVideo,
  klapExportClip,
  klapGetVideoClips,
} from "../lib/klap.services";
import {
  createOneKlapVideo,
  findKlapVideoDocuments,
} from "../services/video-creation/klapVideo.services";
import { insertManyKlapVideoClip } from "../services/video-creation/klapVideoClip.services";
import {
  createOneKlapExportedClip,
  findKlapExportedClipDocuments,
  findOneKlapExportedClipDocument,
} from "../services/video-creation/klapExportedClip.services";
import { FilterQuery } from "mongoose";
import { IKlapExportedClipDocument } from "../models/video-creation/KlapExportedClip.model";

export const generateClipController = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;

  const { language = "en", maxDuration = 60, sourceVideoUrl } = req.body;
  if (!sourceVideoUrl)
    throw new RequestError("sourceVideoUrl is required", 400);

  // check if already processed this video before
  const existingKlapExportedClip = await findOneKlapExportedClipDocument({
    userId: userId,
    sourceVideoUrl: sourceVideoUrl,
  });

  if (existingKlapExportedClip) {
    return sendResponse(res, 200, "Video already generated", {
      klapExportedClip: existingKlapExportedClip,
    });
  }

  // const clipVideoURL = await generateClip(sourceVideoUrl);
  // //console.log(`Generated clip: ${clipVideoURL}`);

  const video = await klapCreateVideo({
    language,
    maxDuration,
    sourceVideoUrl,
  });
  //console.log("video----->", video);
  const { id: videoId } = video;

  // store video to KlapVideo
  const klapVideo = await createOneKlapVideo({
    ...video,
    language,
    maxDuration,
    sourceVideoUrl,
    userId,
  });

  const clipList = await klapGetVideoClips(videoId);
  //console.log("clipList----->", clipList);
  const clipId = clipList[0].id;

  const klapVideoClipdocs = clipList?.map((clip) => {
    return {
      ...clip,
      userId: userId,
      sourceVideoUrl: sourceVideoUrl,
    };
  });

  // store clips to KlapVideoClip
  const klapVideoClips = await insertManyKlapVideoClip(klapVideoClipdocs, {});

  const exportedClip = await klapExportClip({
    clipId: clipId,
    videoId: videoId,
  });

  // store exported clip to KlapVideo
  const klapExportedClip = await createOneKlapExportedClip({
    ...exportedClip,
    userId: userId,
    sourceVideoUrl: sourceVideoUrl,
  });

  //console.log("exportedClip----->", exportedClip);
  return sendResponse(res, 200, "Video created successfully", {
    klapExportedClip,
  });
};

export async function getAllKlapVideosController(req: Request, res: Response) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;

  const klapVideoList = await findKlapVideoDocuments(
    { userId: userId },
    {},
    { sort: { createdAt: -1 } }
  );
  return sendResponse(res, 200, "success", klapVideoList);
}

export const getKlapExportedClipController = async (
  req: Request,
  res: Response
) => {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;

  const filter: FilterQuery<IKlapExportedClipDocument> = { userId: userId };
  const { video_id, sourceVideoUrl } = req.query;
  if (video_id) {
    filter.video_id = video_id;
  }
  if (sourceVideoUrl) {
    filter.sourceVideoUrl = sourceVideoUrl;
  }
  const klapExportedClipList = await findKlapExportedClipDocuments(
    filter,
    {},
    {
      populate: ["klapVideoClip"],
      sort: { createdAt: -1 },
    }
  );
  return sendResponse(res, 200, "success", klapExportedClipList);
};
