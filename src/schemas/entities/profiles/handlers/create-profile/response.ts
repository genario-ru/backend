import * as z from "zod";

import { profileSchema } from "../../entities/profile";
import { profilesRegistry } from "../../registry";

export const createProfileResponseSchema = z
  .object({
    data: profileSchema,
  })
  .register(profilesRegistry, {
    title: "Create profile response",
    description: "Create profile response description",
    ref: "CreateProfileResponseSchema",
  });

export type CreateProfileResponse = z.infer<typeof createProfileResponseSchema>;
