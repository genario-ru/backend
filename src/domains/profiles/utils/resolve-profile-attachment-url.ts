import type { ProfileAttachment } from "@/domains/profiles/schemas/entities/profile-attachment";
import { getSignedS3Url } from "@/lib/s3/utils/get-signed-s3-url";

type ResolveProfileAttachmentUrlParams = {
  status: ProfileAttachment["status"];
  key: string;
};

export async function resolveProfileAttachmentUrl({
  status,
  key,
}: ResolveProfileAttachmentUrlParams): Promise<string | null> {
  if (status !== "ready") {
    return null;
  }

  return getSignedS3Url(key);
}
