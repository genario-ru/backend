import { z } from "@/lib/zod";

import { profileTypeSchema } from "../../entities/profile-type";
import { profilesRegistry } from "../../registry";

export const getProfileTypesResponseSchema = z
  .object({
    data: z.array(profileTypeSchema),
  })
  .register(profilesRegistry, {
    title: "Get profile types response",
    description: "Get profile types response description",
    ref: "GetProfileTypesResponseSchema",
  });

export type GetProfileTypesResponse = z.infer<
  typeof getProfileTypesResponseSchema
>;
