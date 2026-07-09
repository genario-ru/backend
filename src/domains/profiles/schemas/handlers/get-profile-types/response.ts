import { z } from "@/lib/zod";

import { profileTypeSchema } from "../../entities/profile-type";

export const getProfileTypesResponseSchema = z
  .object({
    data: z.array(profileTypeSchema),
  })
  .meta({
    title: "Get profile types response",
    description: "Get profile types response description",
    ref: "GetProfileTypesResponseSchema",
  });

export type GetProfileTypesResponse = z.infer<
  typeof getProfileTypesResponseSchema
>;
