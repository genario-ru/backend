import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { envs } from "@/shared/constants/common/envs";

import { s3 } from "../client";

export async function getSignedS3Url(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: envs.S3_BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3, command, {
    expiresIn: 3600 * 24,
  });
}
