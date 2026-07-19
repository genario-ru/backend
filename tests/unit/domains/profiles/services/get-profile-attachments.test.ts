import { beforeEach, describe, expect, it, vi } from "vitest";

const PROFILE_ID = "9e70ee95-5ca0-4a7f-b84f-c8aa42ddb8db";
const USER_ID = "8d51712d-ebf0-41b6-99ec-71b4f8d27ca9";

const mocks = vi.hoisted(() => ({
  db: {
    query: {
      profile: {
        findFirst: vi.fn(),
      },
      profileImageAttachment: {
        findMany: vi.fn(),
      },
      profileVideoAttachment: {
        findMany: vi.fn(),
      },
    },
  },
  getSignedS3Url: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: mocks.db,
}));

vi.mock("@/lib/s3/utils/get-signed-s3-url", () => ({
  getSignedS3Url: mocks.getSignedS3Url,
}));

const { getProfileAttachments } =
  await import("@/domains/profiles/services/get-profile-attachments");

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getSignedS3Url.mockImplementation(
    async (key: string) => `https://signed/${key}`,
  );
});

describe("getProfileAttachments", () => {
  it("throws NotFound when profile does not belong to user", async () => {
    mocks.db.query.profile.findFirst.mockResolvedValue(undefined);

    await expect(
      getProfileAttachments({
        userId: USER_ID,
        profileId: PROFILE_ID,
      }),
    ).rejects.toMatchObject({
      status: 404,
    });

    expect(
      mocks.db.query.profileImageAttachment.findMany,
    ).not.toHaveBeenCalled();
    expect(
      mocks.db.query.profileVideoAttachment.findMany,
    ).not.toHaveBeenCalled();
  });

  it("returns merged profile attachments sorted by createdAt", async () => {
    mocks.db.query.profile.findFirst.mockResolvedValue({
      id: PROFILE_ID,
      userId: USER_ID,
    });
    mocks.db.query.profileImageAttachment.findMany.mockResolvedValue([
      {
        id: "img-1",
        type: "actor-reference",
        profileId: PROFILE_ID,
        attachmentId: "2fbd8a0a-2cb3-4995-a31f-74f7a8b995e3",
        createdAt: "2026-07-05T12:01:00.000Z",
        updatedAt: "2026-07-05T12:01:00.000Z",
        attachment: {
          id: "2fbd8a0a-2cb3-4995-a31f-74f7a8b995e3",
          userId: USER_ID,
          fileName: "actor.jpg",
          key: "attachments/actor.jpg",
          bucketName: "bucket",
          mimeType: "image/jpeg",
          createdAt: "2026-07-05T12:01:00.000Z",
          updatedAt: "2026-07-05T12:01:00.000Z",
        },
      },
    ]);
    mocks.db.query.profileVideoAttachment.findMany.mockResolvedValue([
      {
        id: "vid-1",
        profileId: PROFILE_ID,
        attachmentId: "6c01d4b1-4886-4d4e-a1cf-a04fdb53853d",
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
        attachment: {
          id: "6c01d4b1-4886-4d4e-a1cf-a04fdb53853d",
          userId: USER_ID,
          fileName: "video.mp4",
          key: "attachments/video.mp4",
          bucketName: "bucket",
          mimeType: "video/mp4",
          createdAt: "2026-07-05T12:00:00.000Z",
          updatedAt: "2026-07-05T12:00:00.000Z",
        },
      },
    ]);

    const result = await getProfileAttachments({
      userId: USER_ID,
      profileId: PROFILE_ID,
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      type: "video-reference",
      profileId: PROFILE_ID,
      attachment: {
        id: "6c01d4b1-4886-4d4e-a1cf-a04fdb53853d",
        fileName: "video.mp4",
        url: "https://signed/attachments/video.mp4",
      },
    });
    expect(result[1]).toMatchObject({
      type: "actor-reference",
      attachment: {
        id: "2fbd8a0a-2cb3-4995-a31f-74f7a8b995e3",
        fileName: "actor.jpg",
        url: "https://signed/attachments/actor.jpg",
      },
    });
  });
});
