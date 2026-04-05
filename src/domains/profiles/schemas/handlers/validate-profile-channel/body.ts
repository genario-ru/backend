import { z } from "@/lib/zod";

export const validateProfileChannelBodySchema = z
  .object({
    url: z.url(),
  })
  .meta({
    title: "Validate profile channel body",
    description: "Validate profile channel body description",
    ref: "ValidateProfileChannelBodySchema",
  });

export type ValidateProfileChannelBody = z.infer<
  typeof validateProfileChannelBodySchema
>;
