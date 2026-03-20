import { z } from "@/lib/zod";

import { profileChannelUrlValidationSchema } from "../../entities/profile-channel-url-validation";

export const validateProfilesChannelsResponseSchema = z
  .object({
    data: z.array(profileChannelUrlValidationSchema),
  })
  .meta({
    title: "Validate profiles channels response",
    description: "Validate profiles channels response description",
    ref: "ValidateProfilesChannelsResponseSchema",
  });

export type ValidateProfilesChannelsResponse = z.infer<
  typeof validateProfilesChannelsResponseSchema
>;
