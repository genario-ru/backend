import { envs } from "@/constants/common/envs";

export function getAttachmentDownloadUrl(attachmentId: string): string {
  return new URL(
    `/api/v1/attachments/${attachmentId}/download`,
    envs.BACKEND_BASE_URL,
  ).toString();
}
