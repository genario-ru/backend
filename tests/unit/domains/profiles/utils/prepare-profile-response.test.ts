import { describe, expect, it } from "vitest";

import type { ProfileExtendedRecord } from "@/domains/profiles/types/profile-response";
import { prepareProfileExtended } from "@/domains/profiles/utils/prepare-profile-extended";

function createProfileExtendedRecord(): ProfileExtendedRecord {
  return {
    id: "9e70ee95-5ca0-4a7f-b84f-c8aa42ddb8db",
    userId: "8d51712d-ebf0-41b6-99ec-71b4f8d27ca9",
    typeId: "6e2f1552-9415-449e-a8e8-a3b91244c77f",
    name: "Profile name",
    description: "Legacy description",
    positioning: "Positioning",
    targetAudience: "Audience",
    additionalInfo: "Additional info",
    createdAt: "2026-07-05T12:00:00.000Z",
    updatedAt: "2026-07-05T12:00:00.000Z",
    type: {
      id: "6e2f1552-9415-449e-a8e8-a3b91244c77f",
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
        platform: {
          id: "7335a4fc-bf2b-4dd8-bb3f-f47ebfb0ee7d",
          name: "YouTube",
          slug: "youtube",
          description: null,
          details: null,
          metadataDetails: null,
          logoUrl: null,
          baseUrl: null,
          urlRegex: null,
          channelUrlRegex: null,
          videoUrlRegex: null,
          hasAutoImport: true,
          priority: 0,
          createdAt: "2026-07-05T12:00:00.000Z",
          updatedAt: "2026-07-05T12:00:00.000Z",
        },
      },
    ],
  };
}

describe("prepareProfileExtended", () => {
  it("prepares profile extended and keeps description as-is", () => {
    const result = prepareProfileExtended(createProfileExtendedRecord());

    expect(result.description).toBe("Legacy description");
    expect(result.platforms).toHaveLength(1);
    expect(result.platforms[0]?.name).toBe("YouTube");
    expect("profileToPlatform" in result).toBe(false);
  });
});
