import * as z from "zod";

import { profileSchema } from "../../entities/profile";


export const deleteProfileResponseSchema = z.object({
  data: profileSchema,
});

export type DeleteProfileResponse = z.infer<typeof deleteProfileResponseSchema>;
