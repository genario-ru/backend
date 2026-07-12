import type { ProfileAttachmentExtended } from "../schemas/entities/profile-attachment";
import type {
  AttachmentRecord,
  ProfileAttachmentRecord,
} from "../types/profile-response";
import { resolveProfileAttachmentUrl } from "./resolve-profile-attachment-url";

type PrepareProfileAttachmentForResponseParams = {
  profileAttachment: ProfileAttachmentRecord;
  attachment: AttachmentRecord;
};

export async function prepareProfileAttachmentForResponse({
  profileAttachment,
  attachment,
}: PrepareProfileAttachmentForResponseParams): Promise<ProfileAttachmentExtended> {
  const { key, ...attachmentData } = attachment;

  const url = await resolveProfileAttachmentUrl({
    status: profileAttachment.status,
    key,
  });

  return {
    ...profileAttachment,
    attachment: {
      ...attachmentData,
      url,
    },
  };
}
