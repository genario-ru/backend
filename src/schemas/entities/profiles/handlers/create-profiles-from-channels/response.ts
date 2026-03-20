import { z } from "@/lib/zod";

import { profilesFromChannelsJobSchema } from "../../entities/profiles-from-channels-job";

export const createProfilesFromChannelsResponseSchema = z
  .object({
    data: profilesFromChannelsJobSchema,
  })
  .meta({
    title: "Create profiles from channels response",
    description: "Create profiles from channels response description",
    ref: "CreateProfilesFromChannelsResponseSchema",
  });

export type CreateProfilesFromChannelsResponse = z.infer<
  typeof createProfilesFromChannelsResponseSchema
>;
