import * as z from "zod";

import { profileExtendedSchema } from "../../entities/profile";
import { profilesRegistry } from "../../registry";

export const getProfileResponseSchema = z
  .object({
    data: profileExtendedSchema,
  })
  .register(profilesRegistry, {
    title: "Get profile response",
    description: "Get profile response description",
    ref: "GetProfileResponseSchema",
  });

export type GetProfileResponse = z.infer<typeof getProfileResponseSchema>;
