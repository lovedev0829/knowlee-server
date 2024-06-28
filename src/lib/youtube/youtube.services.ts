import { S3, GetObjectCommand } from "@aws-sdk/client-s3";
import { RequestError } from "../../utils/globalErrorHandler";
import { findOneThirdPartyConfig } from "../../services/thirdPartyConfig.services";
import { google, youtube_v3 } from "googleapis";
import { getGoogleOAuth2ClientOfUser } from '../google/google.services';

interface UploadVideoParams {
  userId: string;
  videoPath: string;
  title: string;
  description: string;
  tags: string[];
}

// Get stored token from user id
export async function getTokenByUser({ userId }: { userId: string }) {
  const thirdPartyConfig = await findOneThirdPartyConfig({ userId });
  if (!thirdPartyConfig) {
    throw new RequestError("Not Authorized: No third party config found");
  }

  const googleToken = thirdPartyConfig?.google?.token;

  if (!googleToken) {
    throw new RequestError("Not Authorized: No YouTube token found");
  }

  return googleToken?.access_token;
}

export async function uploadVideo({
  userId,
  videoPath,
  title,
  description,
  tags,
}: UploadVideoParams): Promise<youtube_v3.Schema$Video> {
  console.log('Received parameters:', { userId, videoPath, title, description, tags });

  const oauth2Client = await getGoogleOAuth2ClientOfUser({ userId });
  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  const s3 = new S3();

  const videoKey = `videos/${userId}/test_video.mp4`;

  const s3Params = {
    Bucket: 'knowlee',
    Key: videoKey,
  };

  const s3Command = new GetObjectCommand(s3Params);
  const s3Object = await s3.send(s3Command);

  if (!s3Object.Body) {
    throw new RequestError('Failed to retrieve video from S3');
  }

  try {
    const response = await youtube.videos.insert(
      {
        part: ['snippet', 'status'],
        notifySubscribers: false,
        requestBody: {
          snippet: {
            title: title,
            description: description,
            tags: tags,
          },
          status: {
            privacyStatus: 'private',
          },
        },
        media: {
          body: s3Object.Body as NodeJS.ReadableStream,
        },
      },
      {
        onUploadProgress: (evt: { bytesRead: number }) => {
          const progress = (evt.bytesRead / 100) * 100;
          console.log(`${Math.round(progress)}% complete`);
        },
      }
    );

    console.log('Video uploaded successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error uploading video:', error);
    throw new RequestError('Failed to upload video');
  }
}
