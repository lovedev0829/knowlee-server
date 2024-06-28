import axios from "axios";
import { S3, GetObjectCommand } from "@aws-sdk/client-s3";

import { RequestError } from "../../utils/globalErrorHandler";
import { findOneThirdPartyConfig } from "../../services/thirdPartyConfig.services";
import { Readable } from "stream";

const clientId = process.env.TIKTOK_CLIENT_ID!;
const clientSecret = process.env.TIKTOK_CLIENT_SECRET!;
const SERVER_BASE_URL = process.env.SERVER_BASE_URL!;
const tiktokbaseUrl = 'https://www.tiktok.com/v2';
const scope = "video.upload,video.publish";

// replace 127.0.0.1 with localhost
// tiktok redirect URI does not support 127.0.0.1
const redirectUri = `${SERVER_BASE_URL?.replace(
  "127.0.0.1",
  "localhost"
)}/api/third-party/tiktok/auth/callback`;

export type TiktokTokenResponse = {
   access_token: string;
   expires_in: number;
   ext_expires_in: number;
   refresh_token: string;
   scope: string;
   token_type: string;
 };

 
export async function tiktokGetAuthCodeUrl({ userId }: { userId: string }) {

  let url = `${tiktokbaseUrl}/auth/authorize/`;
      url += `?client_key=${clientId}`;
      url += `&scope=${scope}`;
      url += `&code_challenge='challenge'`;
      url += `&code_challenge_method=S256`;
      url += "&response_type=code";
      url += `&redirect_uri=${redirectUri}`;
      url += `&state={"userId" : "${userId}"}`;
    return url;
}

export async function tiktokAcquireTokenByCode({ code }: { code: string }) {
  try {
    const tokenEndpoint = `${tiktokbaseUrl}/oauth/token/`;
    const params = new URLSearchParams({
      client_key: clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    });

    const response = await axios.post(
      tokenEndpoint,
      params.toString(), // Ensure this is a string
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
      }
    );

    console.log("Token response>>>>>>>", response.data);
    return response.data;

  } catch (error: any) {
    console.error("Error during token acquisition:", error?.response?.data || error?.message);
    throw error;
  }
}


export async function tiktokRefreshAccessToken({
   refreshToken,
 }: {
   refreshToken: string;
 }) {
   const data = new URLSearchParams();
   data.append("client_id", clientId);
   data.append("client_secret", clientSecret);
   data.append("grant_type", "refresh_token");
   data.append("refresh_token", refreshToken);
   data.append("scope", scope);
 
   const response = await axios.post<TiktokTokenResponse>(
    `${tiktokbaseUrl}/oauth/token/`,
     data,
     {
       headers: {
         "Content-Type": "application/x-www-form-urlencoded",
       },
     }
   );
   
   return response.data;
 }

// Get Tiktok Access Token from Authenticated User
export async function getTiktokTokenOfUser({
   userId,
 }: {
   userId: string;
 }) {
    const thirdPartyConfig = await findOneThirdPartyConfig({ userId: userId });
    if (!thirdPartyConfig) {
       throw new RequestError("Not Authorized: No third party config found");
    }
 
    const tiktokToken = thirdPartyConfig?.tiktok?.token;
 
    if (!tiktokToken) {
       throw new RequestError("Not Authorized: No TikTok token found");
    }
 
    // request new access token every time to make sure token is valid
    const token = await tiktokRefreshAccessToken({
       refreshToken: tiktokToken.refresh_token,
    });
    return token
 }
 
 export async function postVideo(
  title: string,
  userId: string,
  token: string
): Promise<any> {
  const s3 = new S3();

  const videoKey = `videos/${userId}/test_video.mp4`;
  const s3Params = {
    Bucket: 'knowlee',
    Key: videoKey,
  };

  const s3Command = new GetObjectCommand(s3Params);
  const s3Object = await s3.send(s3Command);

  if (!s3Object.Body || !(s3Object.Body instanceof Readable)) {
    throw new RequestError('Failed to retrieve video from S3');
  }

  // Read the video data from the stream
  const videoBuffer = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    (s3Object.Body as Readable).on('data', (chunk) => chunks.push(chunk));
    (s3Object.Body as Readable).on('end', () => resolve(Buffer.concat(chunks)));
    (s3Object.Body as Readable).on('error', reject);
  });

  const initUrl = `${tiktokbaseUrl}/post/publish/video/init`;
  const initData = {
    "post_info": {
      "title": title,
      "privacy_level": "MUTUAL_FOLLOW_FRIENDS",
      "disable_duet": false,
      "disable_comment": false,
      "disable_stitch": false,
      "video_cover_timestamp_ms": 1000
    },

    "source_info": {
      "source": "FILE_UPLOAD",
      "video_size": videoBuffer.length,
      "chunk_size": 10000000, // adjust chunk size if needed
      "total_chunk_count": Math.ceil(videoBuffer.length / 10000000)
    }
  };

  const initResponse = await axios.post(
    initUrl,
    initData,
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    }
  );

  const uploadUrl = initResponse.data.upload_url;

  const chunkSize = 10000000; // 10MB
  const totalChunks = Math.ceil(videoBuffer.length / chunkSize);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min((i + 1) * chunkSize, videoBuffer.length);
    const chunk = videoBuffer.slice(start, end);

    await axios.put(uploadUrl, chunk, {
      headers: {
        "Content-Range": `bytes ${start}-${end - 1}/${videoBuffer.length}`,
        "Content-Length": chunk.length.toString(),
        "Content-Type": "video/mp4",
        "Authorization": `Bearer ${token}`
      },
    });
  }

  const finalizeUrl = `${tiktokbaseUrl}/post/publish/video/complete`;
  const finalizeData = {
    "upload_id": initResponse.data.upload_id
  };

  const finalizeResponse = await axios.post(
    finalizeUrl,
    finalizeData,
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    }
  );

  return finalizeResponse.data;
}