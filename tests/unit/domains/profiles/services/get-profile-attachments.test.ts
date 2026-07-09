import { beforeEach, describe, expect, it, vi } from "vitest";

const PROFILE_ID = "9e70ee95-5ca0-4a7f-b84f-c8aa42ddb8db";
const USER_ID = "8d51712d-ebf0-41b6-99ec-71b4f8d27ca9";

const mocks = vi.hoisted(() => ({
  db: {
    query: {
      profile: {
        findFirst: vi.fn(),
      },
      profileAttachment: {
        findMany: vi.fn(),
      },
    },
  },
}));

vi.mock("@/db", () => ({
  db: mocks.db,
}));

const { getProfileAttachments } =
  await import("@/domains/profiles/services/get-profile-attachments");

beforeEach(() => {
  vi.clearAllMocks();
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

    expect(mocks.db.query.profileAttachment.findMany).not.toHaveBeenCalled();
  });

  it("returns grouped profile references", async () => {
    mocks.db.query.profile.findFirst.mockResolvedValue({
      id: PROFILE_ID,
      userId: USER_ID,
    });
    mocks.db.query.profileAttachment.findMany.mockResolvedValue([
      {
        type: "video-reference",
        attachment: {
          id: "6c01d4b1-4886-4d4e-a1cf-a04fdb53853d",
          userId: USER_ID,
          fileName: "video.mp4",
          key: "attachments/video.mp4",
          bucketName: "bucket",
          mimeType: "video/mp4",
          previewUrl: null,
          createdAt: "2026-07-05T12:00:00.000Z",
          updatedAt: "2026-07-05T12:00:00.000Z",
        },
      },
      {
        type: "actor-reference",
        attachment: {
          id: "2fbd8a0a-2cb3-4995-a31f-74f7a8b995e3",
          userId: USER_ID,
          fileName: "actor.jpg",
          key: "attachments/actor.jpg",
          bucketName: "bucket",
          mimeType: "image/jpeg",
          previewUrl: null,
          createdAt: "2026-07-05T12:01:00.000Z",
          updatedAt: "2026-07-05T12:01:00.000Z",
        },
      },
    ]);

    const result = await getProfileAttachments({
      userId: USER_ID,
      profileId: PROFILE_ID,
    });

    expect(result).toEqual({
      videoReferences: [
        {
          id: "6c01d4b1-4886-4d4e-a1cf-a04fdb53853d",
          mimeType: "video/mp4",
          fileName: "video.mp4",
          downloadUrl:
            "/api/v1/attachments/6c01d4b1-4886-4d4e-a1cf-a04fdb53853d/download",
          createdAt: "2026-07-05T12:00:00.000Z",
        },
      ],
      thumbnailReferences: [],
      actorReferences: [
        {
          id: "2fbd8a0a-2cb3-4995-a31f-74f7a8b995e3",
          mimeType: "image/jpeg",
          fileName: "actor.jpg",
          downloadUrl:
            "/api/v1/attachments/2fbd8a0a-2cb3-4995-a31f-74f7a8b995e3/download",
          createdAt: "2026-07-05T12:01:00.000Z",
        },
      ],
    });
  });
});
