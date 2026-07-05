import { z } from "@/lib/zod";

import { profileExtendedSchema } from "../../entities/profile";
import { profileReferencesSchema } from "../../entities/profile-reference";

export const getProfileDataSchema = profileExtendedSchema
  .extend({
    references: profileReferencesSchema,
  })
  .meta({
    title: "Get profile data",
    description: "Get profile data description",
    ref: "GetProfileDataSchema",
  });

export type GetProfileData = z.infer<typeof getProfileDataSchema>;

export const getProfileResponseSchema = z
  .object({
    data: getProfileDataSchema,
  })
  .meta({
    title: "Get profile response",
    description: "Get profile response description",
    ref: "GetProfileResponseSchema",
  });

export type GetProfileResponse = z.infer<typeof getProfileResponseSchema>;
