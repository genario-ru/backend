import { DeleteObjectCommand } from "@aws-sdk/client-s3";

import { s3 } from "../client";

type DeleteS3ObjectParams = {
  bucketName: string;
  key: string;
};

export async function deleteS3Object({
  bucketName,
  key,
}: DeleteS3ObjectParams): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );
}
