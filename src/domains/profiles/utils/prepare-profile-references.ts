import { getAttachmentDownloadUrl } from "@/lib/attachments/utils/get-attachment-download-url";

import type { ProfileReferences } from "../schemas/entities/profile-reference";
import type { ProfileAttachmentRelationRecord } from "../types/profile-response";

function createEmptyProfileReferences(): ProfileReferences {
  return {
    videoReferences: [],
    thumbnailReferences: [],
    actorReferences: [],
    transcriptReferences: [],
  };
}

export function prepareProfileReferences(
  attachments: ProfileAttachmentRelationRecord[],
): ProfileReferences {
  const references = createEmptyProfileReferences();

  for (const { attachment, type } of attachments) {
    const referenceItem = {
      id: attachment.id,
      mimeType: attachment.mimeType,
      fileName: attachment.fileName,
      downloadUrl: getAttachmentDownloadUrl(attachment.id),
      createdAt: attachment.createdAt,
    };

    switch (type) {
      case "video-reference":
        references.videoReferences.push(referenceItem);
        break;
      case "thumbnail-reference":
        references.thumbnailReferences.push(referenceItem);
        break;
      case "actor-reference":
        references.actorReferences.push(referenceItem);
        break;
      case "transcript-reference":
        references.transcriptReferences.push(referenceItem);
        break;
    }
  }

  return references;
}
