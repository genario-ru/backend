import { z } from "@/lib/zod";

import { profileExtendedSchema } from "../../entities/profile";

export const createProfileResponseSchema = z
  .object({
    data: profileExtendedSchema,
  })
  .meta({
    title: "Create profile response",
    description: "Create profile response description",
    ref: "CreateProfileResponseSchema",
  });

export type CreateProfileResponse = z.infer<typeof createProfileResponseSchema>;
