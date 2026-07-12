import {
  attachment,
  platform,
  profile,
  profileImageAttachment,
  profileType,
  profileVideoAttachment,
} from "@/db/schema";

export type ProfileRecord = typeof profile.$inferSelect;
export type ProfileTypeRecord = typeof profileType.$inferSelect;
export type PlatformRecord = typeof platform.$inferSelect;
export type AttachmentRecord = typeof attachment.$inferSelect;
export type ProfileImageAttachmentRecord =
  typeof profileImageAttachment.$inferSelect;
export type ProfileVideoAttachmentRecord =
  typeof profileVideoAttachment.$inferSelect;

export type ProfilePlatformRelationRecord = {
  platform: PlatformRecord;
};

export type ProfileImageAttachmentRelationRecord = {
  type: ProfileImageAttachmentRecord["type"];
  attachment: AttachmentRecord;
};

export type ProfileVideoAttachmentRelationRecord = {
  attachment: AttachmentRecord;
};

export type ProfileExtendedRecord = ProfileRecord & {
  type: ProfileTypeRecord | null;
  profileToPlatform: ProfilePlatformRelationRecord[];
};

export type ProfileExtendedWithReferencesRecord = ProfileExtendedRecord & {
  imageAttachments: ProfileImageAttachmentRelationRecord[];
  videoAttachments: ProfileVideoAttachmentRelationRecord[];
};
