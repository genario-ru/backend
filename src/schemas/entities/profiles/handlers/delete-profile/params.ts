import * as z from "zod";

import { profilesRegistry } from "../../registry";

export const deleteProfileParamsSchema = z
  .object({
    profileId: z.uuid(),
  })
  .register(profilesRegistry, {
    title: "Delete profile params",
    description: "Delete profile params description",
    ref: "DeleteProfileParamsSchema",
  });

export type DeleteProfileParams = z.infer<typeof deleteProfileParamsSchema>;
