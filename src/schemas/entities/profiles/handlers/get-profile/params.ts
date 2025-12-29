import * as z from "zod";

import { profilesRegistry } from "../../registry";

export const getProfileParamsSchema = z
  .object({
    profileId: z.uuid(),
  })
  .register(profilesRegistry, {
    title: "Get profile params",
    description: "Get profile params description",
    ref: "GetProfileParamsSchema",
  });

export type GetProfileParams = z.infer<typeof getProfileParamsSchema>;
