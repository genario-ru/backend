import { z } from "@/lib/zod";

export const createProfileChannelVideoParamsSchema = z.object({
  profileId: z.uuid(),
});

export type CreateProfileChannelVideoParams = z.infer<
  typeof createProfileChannelVideoParamsSchema
>;
