import { getSignedS3Url } from "@/lib/s3/utils/get-signed-s3-url";

import type { ProfileAttachmentExtended } from "../schemas/entities/profile-attachment";
import type {
  AttachmentRecord,
  ProfileAttachmentRecord,
} from "../types/profile-response";

type PrepareProfileAttachmentForResponseParams = {
  profileAttachment: ProfileAttachmentRecord;
  attachment: AttachmentRecord;
};

export async function prepareProfileAttachmentForResponse({
  profileAttachment,
  attachment,
}: PrepareProfileAttachmentForResponseParams): Promise<ProfileAttachmentExtended> {
  const { key, bucketName, ...attachmentData } = attachment;

  return {
    ...profileAttachment,
    attachment: {
      ...attachmentData,
      url: await getSignedS3Url(key),
    },
  };
}
