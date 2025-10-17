import * as z from "zod";

import { profileExtendedSchema } from "../../entities/profile";

export const getProfileResponseSchema = z.object({
  data: profileExtendedSchema,
});

export type GetProfileResponse = z.infer<typeof getProfileResponseSchema>;
