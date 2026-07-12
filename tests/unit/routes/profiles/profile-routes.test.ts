import { beforeEach, describe, expect, it, vi } from "vitest";

const PROFILE_ID = "9e70ee95-5ca0-4a7f-b84f-c8aa42ddb8db";
const USER_ID = "8d51712d-ebf0-41b6-99ec-71b4f8d27ca9";
const TYPE_ID = "6e2f1552-9415-449e-a8e8-a3b91244c77f";
const PLATFORM_ID = "7335a4fc-bf2b-4dd8-bb3f-f47ebfb0ee7d";

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
          videoUrlRegex: null,
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

    expect(payload.data.positioning).toBe("Positioning");
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

  it("updates scalar profile fields without references", async () => {
    mockState.db.query.profile.findFirst
      .mockResolvedValueOnce({
        ...createProfileExtendedRecord(),
        profileToPlatform: [],
      })
      .mockResolvedValueOnce({
        ...createProfileExtendedRecord(),
        positioning: "Updated positioning",
      });

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
          positioning: "Updated positioning",
        }),
      },
    );

    expect(response.status).toBe(200);
    expect(mockState.tx.update).toHaveBeenCalledTimes(1);

    const payload = await response.json();

    expect(payload.data.positioning).toBe("Updated positioning");
  });
});
