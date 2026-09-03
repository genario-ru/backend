import { z } from "@/lib/zod";

export const getProfileChannelVideosParamsSchema = z.object({
  profileId: z.uuid(),
});

export type GetProfileChannelVideosParams = z.infer<
  typeof getProfileChannelVideosParamsSchema
>;
