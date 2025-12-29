import { z } from "zod";

import { profileExtendedSchema } from "../../entities/profile";
import { profilesRegistry } from "../../registry";

export const getMyProfilesResponseSchema = z
  .object({
    data: z.array(profileExtendedSchema),
  })
  .register(profilesRegistry, {
    title: "Get my profiles response",
    description: "Get my profiles response description",
    ref: "GetMyProfilesResponseSchema",
  });

export type GetMyProfilesResponse = z.infer<typeof getMyProfilesResponseSchema>;
