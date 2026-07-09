import { createSelectSchema } from "drizzle-zod";

import { profileAttachment } from "@/db/schema";
import { z } from "@/lib/zod";

import { profileReferenceItemSchema } from "./profile-reference";

export const profileAttachmentSchema = createSelectSchema(
  profileAttachment,
).meta({
  title: "Profile attachment",
  description: "Profile attachment description",
  ref: "ProfileAttachmentSchema",
});

export type ProfileAttachment = z.infer<typeof profileAttachmentSchema>;

export const profileAttachmentExtendedSchema = profileAttachmentSchema
  .extend({
    attachment: profileReferenceItemSchema,
  })
  .meta({
    title: "Profile attachment extended",
    description: "Profile attachment extended description",
    ref: "ProfileAttachmentExtendedSchema",
  });

export type ProfileAttachmentExtended = z.infer<
  typeof profileAttachmentExtendedSchema
>;
