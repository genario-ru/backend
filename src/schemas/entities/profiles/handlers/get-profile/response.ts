import { z } from "@/lib/zod";

import { profileExtendedSchema } from "../../entities/profile";
export const getProfileResponseSchema = z
  .object({
    data: profileExtendedSchema,
  })
  .meta({
    title: "Get profile response",
    description: "Get profile response description",
    ref: "GetProfileResponseSchema",
  });

export type GetProfileResponse = z.infer<typeof getProfileResponseSchema>;
