import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { envs } from "@/constants/common/envs";

import { s3 } from "../client";

type UploadBase64ToS3Params = {
  key: string;
  base64Url: string;
};

export async function uploadBase64ToS3({
  key,
  base64Url,
}: UploadBase64ToS3Params) {
  const matches = base64Url.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

  if (matches?.length !== 3) {
    throw new Error("Invalid base64 URL");
  }

  const [, mimeType, base64] = matches;
  const buffer = Buffer.from(base64, "base64");

  const command = new PutObjectCommand({
    Bucket: envs.S3_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  });

  await s3.send(command);

  return getSignedUrl(s3, command, {
    expiresIn: 3600 * 24,
  });
}
