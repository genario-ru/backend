import { z } from "@/lib/zod";

export const getProfileAttachmentsParamsSchema = z.object({
  profileId: z.uuid(),
});

export type GetProfileAttachmentsParams = z.infer<
  typeof getProfileAttachmentsParamsSchema
>;
