import { z } from "@/lib/zod";

import { profileChannelVideoSchema } from "../../entities/profile-channel-video";

export const deleteProfileChannelVideoResponseSchema = z
  .object({
    data: profileChannelVideoSchema,
  })
  .meta({
    title: "Delete profile channel video response",
    description: "Delete profile channel video response description",
    ref: "DeleteProfileChannelVideoResponseSchema",
  });

export type DeleteProfileChannelVideoResponse = z.infer<
  typeof deleteProfileChannelVideoResponseSchema
>;
