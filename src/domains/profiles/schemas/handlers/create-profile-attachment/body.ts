import { profileAttachmentType } from "@/db/schema";
import { z } from "@/lib/zod";

export const createProfileAttachmentBodySchema = z
  .object({
    file: z.file().min(1),
    type: z.enum(profileAttachmentType.enumValues),
  })
  .meta({
    title: "Create profile attachment body",
    description: "Create profile attachment body description",
    ref: "CreateProfileAttachmentBodySchema",
  });

export type CreateProfileAttachmentBody = z.infer<
  typeof createProfileAttachmentBodySchema
>;
