import { beforeEach, describe, expect, it, vi } from "vitest";

const PROFILE_ID = "9e70ee95-5ca0-4a7f-b84f-c8aa42ddb8db";
const USER_ID = "8d51712d-ebf0-41b6-99ec-71b4f8d27ca9";
const TYPE_ID = "6e2f1552-9415-449e-a8e8-a3b91244c77f";
const PLATFORM_ID = "7335a4fc-bf2b-4dd8-bb3f-f47ebfb0ee7d";
const VIDEO_ATTACHMENT_ID = "6c01d4b1-4886-4d4e-a1cf-a04fdb53853d";
const THUMB_ATTACHMENT_ID = "2197b2d5-6d2e-40f7-8d3d-9fa3eebf4a87";
const ACTOR_ATTACHMENT_ID = "2fbd8a0a-2cb3-4995-a31f-74f7a8b995e3";

const mockState = vi.hoisted(() => {
  const tx = {
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const db = {
    query: {
      profile: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      attachment: {
        findMany: vi.fn(),
      },
    },
    transaction: vi.fn(),
  };

  return { db, tx };
});

vi.mock("@/db", () => ({
  db: mockState.db,
}));

vi.mock("@/middleware/rate-limit-middleware", () => ({
  rateLimitMiddleware: () => async (_c: unknown, next: () => Promise<void>) =>
    next(),
}));

vi.mock("@/middleware/openapi-response-middleware", () => ({
  openAPIResponseMiddleware:
    () => async (_c: unknown, next: () => Promise<void>) =>
      next(),
}));

vi.mock("@/middleware/session-middleware", () => ({
  sessionMiddleware: async (
    c: { set: (key: string, value: unknown) => void },
    next: () => Promise<void>,
  ) => {
    c.set("user", { id: USER_ID });

    return next();
  },
}));

vi.mock("@/middleware/subscription-middleware", () => ({
  subscriptionMiddleware: async (
    c: { set: (key: string, value: unknown) => void },
    next: () => Promise<void>,
  ) => {
    c.set("tariff", { maxProfilesAmount: null });

    return next();
  },
}));

function createInsertResult(returningRows?: unknown[]) {
  return {
    values: vi.fn(() => ({
      returning: vi.fn(async () => returningRows ?? []),
    })),
  };
}

function createUpdateResult(returningRows?: unknown[]) {
  return {
    set: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(async () => returningRows ?? []),
      })),
    })),
  };
}

function createDeleteResult() {
  return {
    where: vi.fn(async () => undefined),
  };
}

function createProfileExtendedRecord() {
  return {
    id: PROFILE_ID,
    userId: USER_ID,
    typeId: TYPE_ID,
    name: "Profile name",
    description: "Legacy description",
    positioning: "Positioning",
    targetAudience: "Audience",
    additionalInfo: "Additional info",
    createdAt: "2026-07-05T12:00:00.000Z",
    updatedAt: "2026-07-05T12:00:00.000Z",
    type: {
      id: TYPE_ID,
      slug: "personal",
      name: "Personal",
      description: "Personal profile",
      icon: "user-round",
      createdAt: "2026-07-05T12:00:00.000Z",
      updatedAt: "2026-07-05T12:00:00.000Z",
      priority: 0,
    },
    profileToPlatform: [
      {
        platformId: PLATFORM_ID,
        platform: {
          id: PLATFORM_ID,
          name: "YouTube",
          slug: "youtube",
          description: null,
          details: null,
          metadataDetails: null,
          logoUrl: null,
          baseUrl: null,
          urlRegex: null,
          channelUrlRegex: null,
          hasAutoImport: true,
          priority: 0,
          createdAt: "2026-07-05T12:00:00.000Z",
          updatedAt: "2026-07-05T12:00:00.000Z",
        },
      },
    ],
  };
}

function createProfileWithReferencesRecord() {
  return {
    ...createProfileExtendedRecord(),
    attachments: [
      {
        type: "video-reference" as const,
        attachment: {
          id: VIDEO_ATTACHMENT_ID,
          userId: USER_ID,
          fileName: "video.mp4",
          key: "attachments/video.mp4",
          bucketName: "bucket",
          mimeType: "video/mp4",
          createdAt: "2026-07-05T12:00:00.000Z",
          updatedAt: "2026-07-05T12:00:00.000Z",
        },
      },
      {
        type: "thumbnail-reference" as const,
        attachment: {
          id: THUMB_ATTACHMENT_ID,
          userId: USER_ID,
          fileName: "thumb.png",
          key: "attachments/thumb.png",
          bucketName: "bucket",
          mimeType: "image/png",
          createdAt: "2026-07-05T12:01:00.000Z",
          updatedAt: "2026-07-05T12:01:00.000Z",
        },
      },
    ],
  };
}

describe("profile routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockState.tx.insert.mockImplementation(() => createInsertResult());
    mockState.tx.update.mockImplementation(() => createUpdateResult());
    mockState.tx.delete.mockImplementation(() => createDeleteResult());
    mockState.db.transaction.mockImplementation(async (callback) =>
      callback(mockState.tx),
    );
  });

  it("creates profile with the new general-info body", async () => {
    mockState.db.query.profile.findMany.mockResolvedValue([]);
    mockState.tx.insert.mockImplementationOnce(() =>
      createInsertResult([{ id: PROFILE_ID }]),
    );
    mockState.db.query.profile.findFirst.mockResolvedValue(
      createProfileExtendedRecord(),
    );

    const { createProfileRoute } =
      await import("@/routes/api/v1/profiles/root/post/route");

    const response = await createProfileRoute.request(
      "http://localhost/profiles",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: "Profile name",
          positioning: "Positioning",
          targetAudience: "Audience",
          additionalInfo: "Additional info",
          typeId: TYPE_ID,
          platformIds: [PLATFORM_ID],
        }),
      },
    );

    expect(response.status).toBe(201);

    const payload = await response.json();

    expect(payload.data.name).toBe("Profile name");
    expect(payload.data.positioning).toBe("Positioning");
    expect(payload.data.additionalInfo).toBe("Additional info");
    expect(payload.data.platforms).toHaveLength(1);
    expect(payload.data.tones).toBeUndefined();
  });

  it("returns profile without references in get profile response", async () => {
    mockState.db.query.profile.findFirst.mockResolvedValue(
      createProfileExtendedRecord(),
    );

    const { getProfileRoute } =
      await import("@/routes/api/v1/profiles/profile/root/get/route");

    const response = await getProfileRoute.request(
      `http://localhost/profiles/${PROFILE_ID}`,
    );

    expect(response.status).toBe(200);

    const payload = await response.json();

    expect(payload.data.description).toBe("Legacy description");
    expect(payload.data.references).toBeUndefined();
    expect(payload.data.tones).toBeUndefined();
  });

  it("returns profile summaries without references or tones in my profiles", async () => {
    mockState.db.query.profile.findMany.mockResolvedValue([
      createProfileExtendedRecord(),
    ]);

    const { getMyProfilesRoute } =
      await import("@/routes/api/v1/profiles/my/get/route");

    const response = await getMyProfilesRoute.request(
      "http://localhost/profiles/my",
    );

    expect(response.status).toBe(200);

    const payload = await response.json();

    expect(payload.data[0].platforms).toHaveLength(1);
    expect(payload.data[0].references).toBeUndefined();
    expect(payload.data[0].tones).toBeUndefined();
  });

  it("updates only references without touching scalar profile update", async () => {
    mockState.db.query.profile.findFirst
      .mockResolvedValueOnce({
        ...createProfileExtendedRecord(),
        profileToPlatform: [],
      })
      .mockResolvedValueOnce(createProfileExtendedRecord());
    mockState.db.query.attachment.findMany.mockResolvedValue([
      {
        id: VIDEO_ATTACHMENT_ID,
        userId: USER_ID,
        fileName: "video.mp4",
        key: "attachments/video.mp4",
        bucketName: "bucket",
        mimeType: "video/mp4",
        createdAt: "2026-07-05T12:00:00.000Z",
        updatedAt: "2026-07-05T12:00:00.000Z",
      },
    ]);

    const { updateProfileRoute } =
      await import("@/routes/api/v1/profiles/profile/root/patch/route");

    const response = await updateProfileRoute.request(
      `http://localhost/profiles/${PROFILE_ID}`,
      {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          videoReferences: [VIDEO_ATTACHMENT_ID],
          thumbnailReferences: [],
        }),
      },
    );

    expect(response.status).toBe(200);
    expect(mockState.db.query.attachment.findMany).toHaveBeenCalledTimes(1);
    expect(mockState.tx.update).not.toHaveBeenCalled();
    expect(mockState.tx.delete).toHaveBeenCalledTimes(1);
    expect(mockState.tx.insert).toHaveBeenCalledTimes(1);
  });

  it("clears a reference category when an empty array is passed", async () => {
    mockState.db.query.profile.findFirst
      .mockResolvedValueOnce({
        ...createProfileExtendedRecord(),
        profileToPlatform: [],
      })
      .mockResolvedValueOnce(createProfileExtendedRecord());

    const { updateProfileRoute } =
      await import("@/routes/api/v1/profiles/profile/root/patch/route");

    const response = await updateProfileRoute.request(
      `http://localhost/profiles/${PROFILE_ID}`,
      {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          transcriptReferences: [],
        }),
      },
    );

    expect(response.status).toBe(200);
    expect(mockState.db.query.attachment.findMany).not.toHaveBeenCalled();
    expect(mockState.tx.delete).toHaveBeenCalledTimes(1);
    expect(mockState.tx.insert).not.toHaveBeenCalled();
  });

  it("rejects inaccessible reference attachments", async () => {
    mockState.db.query.profile.findFirst.mockResolvedValue({
      ...createProfileExtendedRecord(),
      profileToPlatform: [],
    });
    mockState.db.query.attachment.findMany.mockResolvedValue([]);

    const { updateProfileRoute } =
      await import("@/routes/api/v1/profiles/profile/root/patch/route");

    const response = await updateProfileRoute.request(
      `http://localhost/profiles/${PROFILE_ID}`,
      {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          actorReferences: [ACTOR_ATTACHMENT_ID],
        }),
      },
    );

    expect(response.status).toBe(404);
  });
});
