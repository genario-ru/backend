import { z } from "@/lib/zod";

import { profileExtendedSchema } from "../../entities/profile";

export const updateProfileResponseSchema = z
  .object({
    data: profileExtendedSchema,
  })
  .meta({
    title: "Update profile response",
    description: "Update profile response description",
    ref: "UpdateProfileResponseSchema",
  });

export type UpdateProfileResponse = z.infer<typeof updateProfileResponseSchema>;
