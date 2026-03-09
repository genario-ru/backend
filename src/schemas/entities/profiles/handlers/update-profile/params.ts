import { z } from "@/lib/zod";

import { profilesRegistry } from "../../registry";

export const updateProfileParamsSchema = z
  .object({
    profileId: z.uuid(),
  })
  .register(profilesRegistry, {
    title: "Update profile params",
    description: "Update profile params description",
    ref: "UpdateProfileParamsSchema",
  });

export type UpdateProfileParams = z.infer<typeof updateProfileParamsSchema>;
