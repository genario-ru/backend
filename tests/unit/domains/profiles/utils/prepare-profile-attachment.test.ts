import { describe, expect, it } from "vitest";

import type {
  AttachmentRecord,
  ProfileAttachmentRecord,
} from "@/domains/profiles/types/profile-response";
import { prepareProfileAttachment } from "@/domains/profiles/utils/prepare-profile-attachment";

function createProfileAttachmentRecord(): ProfileAttachmentRecord {
  return {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    type: "video-reference",
    profileId: "9e70ee95-5ca0-4a7f-b84f-c8aa42ddb8db",
    attachmentId: "6c01d4b1-4886-4d4e-a1cf-a04fdb53853d",
    createdAt: "2026-07-05T12:00:00.000Z",
    updatedAt: "2026-07-05T12:00:00.000Z",
  };
}

function createAttachmentRecord(): AttachmentRecord {
  return {
    id: "6c01d4b1-4886-4d4e-a1cf-a04fdb53853d",
    userId: "8d51712d-ebf0-41b6-99ec-71b4f8d27ca9",
    fileName: "video.mp4",
    key: "attachments/video.mp4",
    bucketName: "bucket",
    mimeType: "video/mp4",
    previewUrl: null,
    createdAt: "2026-07-05T12:00:00.000Z",
    updatedAt: "2026-07-05T12:00:00.000Z",
  };
}

describe("prepareProfileAttachment", () => {
  it("maps profile attachment and nested attachment with downloadUrl", () => {
    const profileAttachment = createProfileAttachmentRecord();
    const attachment = createAttachmentRecord();

    expect(
      prepareProfileAttachment({
        profileAttachment,
        attachment,
      }),
    ).toEqual({
      id: profileAttachment.id,
      type: "video-reference",
      profileId: profileAttachment.profileId,
      attachmentId: attachment.id,
      createdAt: profileAttachment.createdAt,
      updatedAt: profileAttachment.updatedAt,
      attachment: {
        id: attachment.id,
        mimeType: attachment.mimeType,
        fileName: attachment.fileName,
        downloadUrl: `/api/v1/attachments/${attachment.id}/download`,
        createdAt: attachment.createdAt,
      },
    });
  });
});
