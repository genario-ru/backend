import { posix } from "node:path";

import slugify from "slugify";

import { createS3Key } from "@/lib/s3/utils/create-s3-key";

const FALLBACK_ATTACHMENT_FILE_NAME = "file";

type CreateUploadedAttachmentS3KeyParams = {
  userId: string;
  attachmentId: string;
  fileName: string;
};

function sanitizeAttachmentFileName(fileName: string): string {
  const normalizedFileName = fileName.replaceAll("\\", "/").trim();
  const baseFileName = posix.basename(normalizedFileName);
  const extension = posix
    .extname(baseFileName)
    .toLowerCase()
    .replace(/[^.a-z0-9]/g, "");
  const rawStem = extension
    ? baseFileName.slice(0, -extension.length)
    : baseFileName;
  const safeStem =
    slugify(rawStem, {
      lower: true,
      strict: true,
      trim: true,
    }) || FALLBACK_ATTACHMENT_FILE_NAME;

  return `${safeStem}${extension}`;
}

export function createUploadedAttachmentS3Key({
  userId,
  attachmentId,
  fileName,
}: CreateUploadedAttachmentS3KeyParams): string {
  const sanitizedFileName = sanitizeAttachmentFileName(fileName);

  return createS3Key({
    userId,
    folderName: "attachments",
    fileName: `${attachmentId}-${sanitizedFileName}`,
  });
}
