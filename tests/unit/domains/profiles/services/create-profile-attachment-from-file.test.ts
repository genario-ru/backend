import { beforeEach, describe, expect, it, vi } from "vitest";

import { profileAttachment } from "@/db/schema";

const PROFILE_ID = "9e70ee95-5ca0-4a7f-b84f-c8aa42ddb8db";
const USER_ID = "8d51712d-ebf0-41b6-99ec-71b4f8d27ca9";
const ATTACHMENT_ID = "6c01d4b1-4886-4d4e-a1cf-a04fdb53853d";
const PROFILE_ATTACHMENT_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

const mocks = vi.hoisted(() => ({
  db: {
    query: {
      profile: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(),
  },
  createAttachmentFromFile: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: mocks.db,
}));

vi.mock("@/domains/attachments/services/create-attachment-from-file", () => ({
  createAttachmentFromFile: mocks.createAttachmentFromFile,
}));

const { createProfileAttachmentFromFile } =
  await import("@/domains/profiles/services/create-profile-attachment-from-file");

function createAttachment() {
  return {
    id: ATTACHMENT_ID,
    userId: USER_ID,
    fileName: "video.mp4",
    key: "user-files/attachments/video.mp4",
    bucketName: "bucket",
    mimeType: "video/mp4",
    previewUrl: null,
    createdAt: "2026-07-05T12:00:00.000Z",
    updatedAt: "2026-07-05T12:00:00.000Z",
  };
}

function createProfileAttachmentRow() {
  return {
    id: PROFILE_ATTACHMENT_ID,
    type: "video-reference" as const,
    profileId: PROFILE_ID,
    attachmentId: ATTACHMENT_ID,
    createdAt: "2026-07-05T12:00:00.000Z",
    updatedAt: "2026-07-05T12:00:00.000Z",
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createProfileAttachmentFromFile", () => {
  it("throws NotFound when profile does not belong to user", async () => {
    mocks.db.query.profile.findFirst.mockResolvedValue(undefined);

    await expect(
      createProfileAttachmentFromFile({
        userId: USER_ID,
        profileId: PROFILE_ID,
        type: "video-reference",
        file: new File(["content"], "video.mp4", { type: "video/mp4" }),
      }),
    ).rejects.toMatchObject({
      status: 404,
    });

    expect(mocks.createAttachmentFromFile).not.toHaveBeenCalled();
  });

  it("creates attachment and profile attachment link", async () => {
    const createdAttachment = createAttachment();
    const createdProfileAttachment = createProfileAttachmentRow();

    mocks.db.query.profile.findFirst.mockResolvedValue({
      id: PROFILE_ID,
      userId: USER_ID,
    });
    mocks.createAttachmentFromFile.mockResolvedValue(createdAttachment);
    mocks.db.insert.mockReturnValue({
      values: vi.fn(() => ({
        returning: vi.fn().mockResolvedValue([createdProfileAttachment]),
      })),
    });

    const result = await createProfileAttachmentFromFile({
      userId: USER_ID,
      profileId: PROFILE_ID,
      type: "video-reference",
      file: new File(["content"], "video.mp4", { type: "video/mp4" }),
    });

    expect(mocks.createAttachmentFromFile).toHaveBeenCalledWith({
      userId: USER_ID,
      file: expect.any(File),
    });
    expect(mocks.db.insert).toHaveBeenCalledWith(profileAttachment);
    expect(result).toMatchObject({
      id: PROFILE_ATTACHMENT_ID,
      type: "video-reference",
      profileId: PROFILE_ID,
      attachmentId: ATTACHMENT_ID,
      attachment: {
        id: ATTACHMENT_ID,
        fileName: "video.mp4",
        downloadUrl: `/api/v1/attachments/${ATTACHMENT_ID}/download`,
      },
    });
  });
});
