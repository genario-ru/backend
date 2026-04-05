import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { envs } from "@/shared/constants/common/envs";

import { s3 } from "../client";

type UploadBase64ToS3Params = {
  key: string;
  mimeType: string;
  base64: string;
};

export async function uploadBase64ToS3({
  key,
  mimeType,
  base64,
}: UploadBase64ToS3Params): Promise<string> {
  const buffer = Buffer.from(base64, "base64");

  const command = new PutObjectCommand({
    Bucket: envs.S3_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  });

  await s3.send(command);

  const url = await getSignedUrl(s3, command, {
    expiresIn: 3600 * 24,
  });

  return url;
}
