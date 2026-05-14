import { S3Client } from "@aws-sdk/client-s3";

import { env } from "@/env";

export const s3 = new S3Client({
  endpoint: env.S3_BUCKET_BASE_URL,
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
});
