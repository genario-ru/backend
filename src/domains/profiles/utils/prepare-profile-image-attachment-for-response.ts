import { getSignedS3Url } from "@/lib/s3/utils/get-signed-s3-url";

import type { ProfileImageAttachmentExtended } from "../schemas/entities/profile-image-attachment";
import type {
  AttachmentRecord,
  ProfileImageAttachmentRecord,
} from "../types/profile-response";

type PrepareProfileImageAttachmentForResponseParams = {
  profileImageAttachment: ProfileImageAttachmentRecord;
  attachment: AttachmentRecord;
};

export async function prepareProfileImageAttachmentForResponse({
  profileImageAttachment,
  attachment,
}: PrepareProfileImageAttachmentForResponseParams): Promise<ProfileImageAttachmentExtended> {
  const { key, bucketName, ...attachmentData } = attachment;

  return {
    ...profileImageAttachment,
    attachment: {
      ...attachmentData,
      url: await getSignedS3Url(key),
    },
  };
}
