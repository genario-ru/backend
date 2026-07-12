import { createWriteStream } from "node:fs";
import type { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

import { GetObjectCommand } from "@aws-sdk/client-s3";

import { s3 } from "../client";

type DownloadS3ObjectToFileParams = {
  bucketName: string;
  key: string;
  filePath: string;
};

export async function downloadS3ObjectToFile({
  bucketName,
  key,
  filePath,
}: DownloadS3ObjectToFileParams): Promise<void> {
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );

  if (!response.Body) {
    throw new Error(`S3 object body is empty for key ${key}`);
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await pipeline(response.Body as Readable, createWriteStream(filePath));
}
