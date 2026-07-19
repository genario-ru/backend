export function getAttachmentDownloadFileName(
  attachmentId: string,
  fileName: string | null | undefined,
): string {
  if (!fileName?.trim()) {
    return `attachment-${attachmentId}`;
  }

  return fileName.trim();
}

export function createContentDisposition(fileName: string): string {
  const asciiFileName = fileName
    .replace(/[^\x20-\x7E]/g, "_")
    .replace(/["\\]/g, "_");

  return `attachment; filename="${asciiFileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

export function hasTransformToByteArray(
  body: unknown,
): body is { transformToByteArray: () => Promise<Uint8Array> } {
  const bodyRecord = body as { transformToByteArray?: unknown } | null;

  return (
    typeof body === "object" &&
    body !== null &&
    "transformToByteArray" in body &&
    typeof bodyRecord?.transformToByteArray === "function"
  );
}
