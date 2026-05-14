import { PutObjectCommand } from "@aws-sdk/client-s3";

import { env } from "@/env";

import { s3 } from "../client";

type UploadBufferToS3Params = {
  key: string;
  mimeType: string;
  buffer: Buffer;
};

export async function uploadBufferToS3({
  key,
  mimeType,
  buffer,
}: UploadBufferToS3Params): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  });

  await s3.send(command);
}
