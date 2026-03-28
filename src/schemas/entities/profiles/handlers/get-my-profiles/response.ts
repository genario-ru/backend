import { z } from "zod";

import { profileExtendedSchema } from "../../entities/profile";

export const getMyProfilesResponseSchema = z
  .object({
    data: z.array(profileExtendedSchema),
  })
  .meta({
    title: "Get my profiles response",
    description: "Get my profiles response description",
    ref: "GetMyProfilesResponseSchema",
  });

export type GetMyProfilesResponse = z.infer<typeof getMyProfilesResponseSchema>;
