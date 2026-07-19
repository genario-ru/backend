import { getSignedS3Url } from "@/lib/s3/utils/get-signed-s3-url";

import type { ProfileVideoAttachmentExtended } from "../schemas/entities/profile-video-attachment";
import { PROFILE_ATTACHMENT_VIDEO_TYPE } from "../schemas/handlers/create-profile-attachment/body";
import type {
  AttachmentRecord,
  ProfileVideoAttachmentRecord,
} from "../types/profile-response";

type PrepareProfileVideoAttachmentForResponseParams = {
  profileVideoAttachment: ProfileVideoAttachmentRecord;
  attachment: AttachmentRecord;
};

export async function prepareProfileVideoAttachmentForResponse({
  profileVideoAttachment,
  attachment,
}: PrepareProfileVideoAttachmentForResponseParams): Promise<ProfileVideoAttachmentExtended> {
  const { key, bucketName, ...attachmentData } = attachment;

  return {
    ...profileVideoAttachment,
    type: PROFILE_ATTACHMENT_VIDEO_TYPE,
    attachment: {
      ...attachmentData,
      url: await getSignedS3Url(key),
    },
  };
}
