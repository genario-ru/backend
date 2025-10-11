import * as z from "zod";

import { profileSchema } from "../../entities/profile";

export const updateProfileResponseSchema = z.object({
  data: profileSchema,
});

export type UpdateProfileResponse = z.infer<typeof updateProfileResponseSchema>;
