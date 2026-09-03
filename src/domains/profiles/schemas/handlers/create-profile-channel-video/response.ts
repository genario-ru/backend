import { z } from "@/lib/zod";

import { profileChannelVideoSchema } from "../../entities/profile-channel-video";

export const createProfileChannelVideoResponseSchema = z
  .object({
    data: profileChannelVideoSchema,
  })
  .meta({
    title: "Create profile channel video response",
    description: "Create profile channel video response description",
    ref: "CreateProfileChannelVideoResponseSchema",
  });

export type CreateProfileChannelVideoResponse = z.infer<
  typeof createProfileChannelVideoResponseSchema
>;
