import { z } from "@/lib/zod";

import { profileSchema } from "../../entities/profile";
export const createProfileResponseSchema = z
  .object({
    data: profileSchema,
  })
  .meta({
    title: "Create profile response",
    description: "Create profile response description",
    ref: "CreateProfileResponseSchema",
  });

export type CreateProfileResponse = z.infer<typeof createProfileResponseSchema>;
