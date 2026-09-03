import { z } from "@/lib/zod";

import { profileChannelVideoSchema } from "../../entities/profile-channel-video";

export const getProfileChannelVideosResponseSchema = z
  .object({
    data: z.array(profileChannelVideoSchema),
  })
  .meta({
    title: "Get profile channel videos response",
    description: "Get profile channel videos response description",
    ref: "GetProfileChannelVideosResponseSchema",
  });

export type GetProfileChannelVideosResponse = z.infer<
  typeof getProfileChannelVideosResponseSchema
>;
