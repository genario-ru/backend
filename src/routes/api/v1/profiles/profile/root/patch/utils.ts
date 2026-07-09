import type { UpdateProfileBody } from "@/domains/profiles/schemas/handlers/update-profile/body";

export const profileReferenceFields = [
  {
    requestField: "videoReferences",
    attachmentType: "video-reference",
  },
  {
    requestField: "thumbnailReferences",
    attachmentType: "thumbnail-reference",
  },
  {
    requestField: "actorReferences",
    attachmentType: "actor-reference",
  },
] as const;

export function getProfileReferenceUpdates(body: UpdateProfileBody) {
  return profileReferenceFields.reduce<
    Array<{
      attachmentIds: string[];
      attachmentType: (typeof profileReferenceFields)[number]["attachmentType"];
    }>
  >((updates, { requestField, attachmentType }) => {
    const attachmentIds = body[requestField];

    if (!attachmentIds) {
      return updates;
    }

    updates.push({
      attachmentIds,
      attachmentType,
    });

    return updates;
  }, []);
}
