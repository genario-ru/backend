import { createReadStream } from "node:fs";

import { PutObjectCommand } from "@aws-sdk/client-s3";

import { env } from "@/env";

import { s3 } from "../client";

type UploadFileToS3Params = {
  key: string;
  mimeType: string;
  filePath: string;
};

export async function uploadFileToS3({
  key,
  mimeType,
  filePath,
}: UploadFileToS3Params): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: key,
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    Body: createReadStream(filePath),
    ContentType: mimeType,
  });

  await s3.send(command);
}
