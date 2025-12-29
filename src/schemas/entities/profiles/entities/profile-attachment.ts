import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { profileAttachment } from "@/db/schema";

import { attachmentSchema } from "../../attachments/entities/attachment";
import { profilesRegistry } from "../registry";

export const profileAttachmentSchema = createSelectSchema(
  profileAttachment,
).register(profilesRegistry, {
  title: "Profile attachment",
  description: "Profile attachment description",
  ref: "ProfileAttachmentSchema",
});

export type ProfileAttachment = z.infer<typeof profileAttachmentSchema>;

export const ProfileAttachmentExtendedSchema = profileAttachmentSchema
  .extend({
    attachment: attachmentSchema,
  })
  .register(profilesRegistry, {
    title: "Profile attachment extended",
    description: "Profile attachment extended description",
    ref: "ProfileAttachmentExtendedSchema",
  });

export type ProfileAttachmentExtended = z.infer<
  typeof ProfileAttachmentExtendedSchema
>;
