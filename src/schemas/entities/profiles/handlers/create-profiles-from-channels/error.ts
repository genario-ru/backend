import { z } from "@/lib/zod";

import { profileChannelUrlValidationSchema } from "../../entities/profile-channel-url-validation";

export const createProfilesFromChannelsErrorSchema = z
  .object({
    data: z.array(profileChannelUrlValidationSchema),
  })
  .meta({
    title: "Create profiles from channels error",
    description: "Create profiles from channels error description",
    ref: "CreateProfilesFromChannelsErrorSchema",
  });

export type CreateProfilesFromChannelsError = z.infer<
  typeof createProfilesFromChannelsErrorSchema
>;
