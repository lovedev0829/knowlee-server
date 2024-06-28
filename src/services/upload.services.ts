import { Upload } from "@aws-sdk/lib-storage";
import { S3 } from "@aws-sdk/client-s3";
import { MulterFile } from "../types/file";
import { RequestError } from "../utils/globalErrorHandler";

const accessKeyId = process.env.AWS_ACCESS_KEY_ID!;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!;
const region = process.env.AWS_REGION!;
const bucketName = process.env.AWS_BUCKET_NAME!;

// AWS JS SDK v3 does not support global configuration.
export const s3 = new S3({
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  region,
});

export const uploadAvatarOnS3Bucket = async (file: MulterFile, userId: string) => {

  try {
    if (!accessKeyId || !secretAccessKey || !region || !bucketName) throw new RequestError("Missing AWS vars", 500)

    const avatarKey = `avatars/${userId}/${Date.now()}-${file.originalname}`;

    const s3Response = await new Upload({
      client: s3,
      params: {
        Bucket: bucketName,
        Key: avatarKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      },
    }).done();

    const imageURL = s3Response.Location;
    return imageURL

  } catch (error) {
    //console.log(error);
    throw new RequestError("Error uploading avatar on server", 500);
  }
};

export const uploadImagesForInterpretationOnS3Bucket = async (file: MulterFile, userId: string) => {

  try {
    if (!accessKeyId || !secretAccessKey || !region || !bucketName) throw new RequestError("Missing AWS vars", 500)
    const imageInterpreterKey = `imagesinterpretation/${userId}/${Date.now()}-${file.originalname}`;

    const s3Response = await new Upload({
      client: s3,
      params: {
        Bucket: bucketName,
        Key: imageInterpreterKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      },
    }).done();

    const imageURL = s3Response.Location;
    return imageURL

  } catch (error) {
    //console.log(error);
    throw new RequestError("Error uploading avatar on server", 500);
  }
};