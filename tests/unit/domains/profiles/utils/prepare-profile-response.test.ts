import { describe, expect, it } from "vitest";

import type {
  ProfileExtendedRecord,
  ProfileExtendedWithReferencesRecord,
} from "@/domains/profiles/types/profile-response";
import { prepareProfileExtended } from "@/domains/profiles/utils/prepare-profile-extended";
import { prepareProfileReferences } from "@/domains/profiles/utils/prepare-profile-references";

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

function createProfileWithReferencesRecord(): ProfileExtendedWithReferencesRecord {
  return {
    ...createProfileExtendedRecord(),
    attachments: [
      {
        type: "video-reference",
        attachment: {
          id: "6c01d4b1-4886-4d4e-a1cf-a04fdb53853d",
          userId: "8d51712d-ebf0-41b6-99ec-71b4f8d27ca9",
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
        type: "thumbnail-reference",
        attachment: {
          id: "2197b2d5-6d2e-40f7-8d3d-9fa3eebf4a87",
          userId: "8d51712d-ebf0-41b6-99ec-71b4f8d27ca9",
          fileName: "thumb.png",
          key: "attachments/thumb.png",
          bucketName: "bucket",
          mimeType: "image/png",
          previewUrl: null,
          createdAt: "2026-07-05T12:01:00.000Z",
          updatedAt: "2026-07-05T12:01:00.000Z",
        },
      },
      {
        type: "actor-reference",
        attachment: {
          id: "2fbd8a0a-2cb3-4995-a31f-74f7a8b995e3",
          userId: "8d51712d-ebf0-41b6-99ec-71b4f8d27ca9",
          fileName: "actor.jpg",
          key: "attachments/actor.jpg",
          bucketName: "bucket",
          mimeType: "image/jpeg",
          previewUrl: null,
          createdAt: "2026-07-05T12:02:00.000Z",
          updatedAt: "2026-07-05T12:02:00.000Z",
        },
      },
    ],
  };
}

describe("prepareProfileResponse", () => {
  it("prepares profile extended and keeps description as-is", () => {
    const result = prepareProfileExtended(createProfileExtendedRecord());

    expect(result.description).toBe("Legacy description");
    expect(result.platforms).toHaveLength(1);
    expect(result.platforms[0]?.name).toBe("YouTube");
    expect("profileToPlatform" in result).toBe(false);
  });

  it("groups profile attachments by category and exposes fileName/downloadUrl", () => {
    const grouped = prepareProfileReferences(
      createProfileWithReferencesRecord().attachments,
    );

    expect(grouped.videoReferences[0]).toMatchObject({
      fileName: "video.mp4",
      downloadUrl:
        "/api/v1/attachments/6c01d4b1-4886-4d4e-a1cf-a04fdb53853d/download",
    });
    expect(grouped.thumbnailReferences[0]?.fileName).toBe("thumb.png");
    expect(grouped.actorReferences[0]?.fileName).toBe("actor.jpg");
  });
});
