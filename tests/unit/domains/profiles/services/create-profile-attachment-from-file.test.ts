import { beforeEach, describe, expect, it, vi } from "vitest";

import { profileVideoAttachment } from "@/db/schema";

const PROFILE_ID = "9e70ee95-5ca0-4a7f-b84f-c8aa42ddb8db";
const USER_ID = "8d51712d-ebf0-41b6-99ec-71b4f8d27ca9";
const ATTACHMENT_ID = "6c01d4b1-4886-4d4e-a1cf-a04fdb53853d";
const PROFILE_VIDEO_ATTACHMENT_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

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
  enqueueProfileVideoAttachmentEnrichment: vi.fn(),
  getSignedS3Url: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: mocks.db,
}));

vi.mock("@/domains/attachments/services/create-attachment-from-file", () => ({
  createAttachmentFromFile: mocks.createAttachmentFromFile,
}));

vi.mock("@/mq/profile-video-attachment-enrichment/queue", () => ({
  enqueueProfileVideoAttachmentEnrichment:
    mocks.enqueueProfileVideoAttachmentEnrichment,
}));

vi.mock("@/lib/s3/utils/get-signed-s3-url", () => ({
  getSignedS3Url: mocks.getSignedS3Url,
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
    createdAt: "2026-07-05T12:00:00.000Z",
    updatedAt: "2026-07-05T12:00:00.000Z",
  };
}

function createProfileVideoAttachmentRow() {
  return {
    id: PROFILE_VIDEO_ATTACHMENT_ID,
    profileId: PROFILE_ID,
    attachmentId: ATTACHMENT_ID,
    summary: null,
    mainTopics: null,
    keyPoints: null,
    tone: null,
    targetAudience: null,
    quotes: null,
    timeline: null,
    wordCount: null,
    segments: null,
    transcript: null,
    transcriptSegments: null,
    createdAt: "2026-07-05T12:00:00.000Z",
    updatedAt: "2026-07-05T12:00:00.000Z",
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getSignedS3Url.mockResolvedValue("https://signed/video.mp4");
  mocks.enqueueProfileVideoAttachmentEnrichment.mockResolvedValue(undefined);
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

  it("creates attachment, profile video attachment link and enqueues enrichment", async () => {
    const createdAttachment = createAttachment();
    const createdProfileVideoAttachment = createProfileVideoAttachmentRow();

    mocks.db.query.profile.findFirst.mockResolvedValue({
      id: PROFILE_ID,
      userId: USER_ID,
    });
    mocks.createAttachmentFromFile.mockResolvedValue(createdAttachment);
    mocks.db.insert.mockReturnValue({
      values: vi.fn(() => ({
        returning: vi.fn().mockResolvedValue([createdProfileVideoAttachment]),
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
    expect(mocks.db.insert).toHaveBeenCalledWith(profileVideoAttachment);
    expect(mocks.enqueueProfileVideoAttachmentEnrichment).toHaveBeenCalledWith({
      profileVideoAttachmentId: PROFILE_VIDEO_ATTACHMENT_ID,
    });
    expect(result).toMatchObject({
      id: PROFILE_VIDEO_ATTACHMENT_ID,
      type: "video-reference",
      profileId: PROFILE_ID,
      attachmentId: ATTACHMENT_ID,
      attachment: {
        id: ATTACHMENT_ID,
        fileName: "video.mp4",
        url: "https://signed/video.mp4",
      },
    });
  });
});
