import { env } from "@/env";

type CreateS3ObjectUrlParams = {
  bucketName: string;
  key: string;
};

export function createS3ObjectUrl({
  bucketName,
  key,
}: CreateS3ObjectUrlParams): string {
  const baseUrl = env.S3_BUCKET_BASE_URL.replace(/\/$/, "");
  const encodedKey = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${baseUrl}/${bucketName}/${encodedKey}`;
}
