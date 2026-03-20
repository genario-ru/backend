import { z } from "@/lib/zod";

export const validateProfilesChannelsBodySchema = z
  .object({
    urls: z.array(z.string()),
  })
  .meta({
    title: "Validate profiles channels body",
    description: "Validate profiles channels body description",
    ref: "ValidateProfilesChannelsBodySchema",
  });

export type ValidateProfilesChannelsBody = z.infer<
  typeof validateProfilesChannelsBodySchema
>;
