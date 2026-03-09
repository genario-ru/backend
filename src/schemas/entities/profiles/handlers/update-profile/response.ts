import { z } from "@/lib/zod";

import { profileSchema } from "../../entities/profile";
import { profilesRegistry } from "../../registry";

export const updateProfileResponseSchema = z
  .object({
    data: profileSchema,
  })
  .register(profilesRegistry, {
    title: "Update profile response",
    description: "Update profile response description",
    ref: "UpdateProfileResponseSchema",
  });

export type UpdateProfileResponse = z.infer<typeof updateProfileResponseSchema>;
