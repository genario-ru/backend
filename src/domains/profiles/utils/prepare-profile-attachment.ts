import { getAttachmentDownloadUrl } from "@/lib/attachments/utils/get-attachment-download-url";

import type { ProfileAttachmentExtended } from "../schemas/entities/profile-attachment";
import type {
  AttachmentRecord,
  ProfileAttachmentRecord,
} from "../types/profile-response";

type PrepareProfileAttachmentParams = {
  profileAttachment: ProfileAttachmentRecord;
  attachment: AttachmentRecord;
};

export function prepareProfileAttachment({
  profileAttachment,
  attachment,
}: PrepareProfileAttachmentParams): ProfileAttachmentExtended {
  return {
    id: profileAttachment.id,
    type: profileAttachment.type,
    profileId: profileAttachment.profileId,
    attachmentId: profileAttachment.attachmentId,
    createdAt: profileAttachment.createdAt,
    updatedAt: profileAttachment.updatedAt,
    attachment: {
      id: attachment.id,
      mimeType: attachment.mimeType,
      fileName: attachment.fileName,
      downloadUrl: getAttachmentDownloadUrl(attachment.id),
      createdAt: attachment.createdAt,
    },
  };
}
