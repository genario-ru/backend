import {
  attachment,
  platform,
  profile,
  profileAttachment,
  profileType,
} from "@/db/schema";

export type ProfileRecord = typeof profile.$inferSelect;
export type ProfileTypeRecord = typeof profileType.$inferSelect;
export type PlatformRecord = typeof platform.$inferSelect;
export type AttachmentRecord = typeof attachment.$inferSelect;
export type ProfileAttachmentRecord = typeof profileAttachment.$inferSelect;

export type ProfilePlatformRelationRecord = {
  platform: PlatformRecord;
};

export type ProfileAttachmentRelationRecord = {
  type: ProfileAttachmentRecord["type"];
  attachment: AttachmentRecord;
};

export type ProfileExtendedRecord = ProfileRecord & {
  type: ProfileTypeRecord | null;
  profileToPlatform: ProfilePlatformRelationRecord[];
};

export type ProfileExtendedWithReferencesRecord = ProfileExtendedRecord & {
  attachments: ProfileAttachmentRelationRecord[];
};
