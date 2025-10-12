import * as z from "zod";

import { profileTypeSchema } from "../../entities/profile-type";

export const getProfileTypesResponseSchema = z.object({
  data: z.array(profileTypeSchema),
});

export type GetProfileTypesResponse = z.infer<
  typeof getProfileTypesResponseSchema
>;
