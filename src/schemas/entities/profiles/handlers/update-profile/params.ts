import { z } from "@/lib/zod";

export const updateProfileParamsSchema = z
  .object({
    profileId: z.uuid(),
  })
  .meta({
    title: "Update profile params",
    description: "Update profile params description",
    ref: "UpdateProfileParamsSchema",
  });

export type UpdateProfileParams = z.infer<typeof updateProfileParamsSchema>;
