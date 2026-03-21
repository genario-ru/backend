import { z } from "@/lib/zod";

import { profileChannelUrlValidationSchema } from "../../entities/profile-channel-url-validation";

export const validateProfileChannelResponseSchema = z
  .object({
    data: profileChannelUrlValidationSchema,
  })
  .meta({
    title: "Validate profile channel response",
    description: "Validate profile channel response description",
    ref: "ValidateProfileChannelResponseSchema",
  });

export type ValidateProfileChannelResponse = z.infer<
  typeof validateProfileChannelResponseSchema
>;
