import { z } from "@/lib/zod";

import { profileSchema } from "../../entities/profile";
export const updateProfileResponseSchema = z
  .object({
    data: profileSchema,
  })
  .meta({
    title: "Update profile response",
    description: "Update profile response description",
    ref: "UpdateProfileResponseSchema",
  });

export type UpdateProfileResponse = z.infer<typeof updateProfileResponseSchema>;
