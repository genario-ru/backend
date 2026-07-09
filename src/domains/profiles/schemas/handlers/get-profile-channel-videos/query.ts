import { z } from "@/lib/zod";

export const getProfileChannelVideosQuerySchema = z.object({
  profileId: z.uuid(),
});

export type GetProfileChannelVideosQuery = z.infer<
  typeof getProfileChannelVideosQuerySchema
>;
