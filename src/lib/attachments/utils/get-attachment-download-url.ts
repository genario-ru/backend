export function getAttachmentDownloadUrl(attachmentId: string): string {
  return `/api/v1/attachments/${attachmentId}/download`;
}
