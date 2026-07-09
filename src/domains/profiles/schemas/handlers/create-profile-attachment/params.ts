import { z } from "@/lib/zod";

export const createProfileAttachmentParamsSchema = z.object({
  profileId: z.uuid(),
});

export type CreateProfileAttachmentParams = z.infer<
  typeof createProfileAttachmentParamsSchema
>;
