import { z } from "@/lib/zod";

import { profileSchema } from "../../entities/profile";
export const deleteProfileResponseSchema = z
  .object({
    data: profileSchema,
  })
  .meta({
    title: "Delete profile response",
    description: "Delete profile response description",
    ref: "DeleteProfileResponseSchema",
  });

export type DeleteProfileResponse = z.infer<typeof deleteProfileResponseSchema>;
