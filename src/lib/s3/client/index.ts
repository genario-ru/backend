import { S3Client } from "@aws-sdk/client-s3";

import { envs } from "@/constants/common/envs";

export const s3 = new S3Client({
  region: envs.S3_REGION,
  credentials: {
    accessKeyId: envs.S3_ACCESS_KEY,
    secretAccessKey: envs.S3_SECRET_ACCESS_KEY,
  },
});
