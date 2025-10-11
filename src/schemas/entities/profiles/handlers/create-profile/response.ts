import * as z from "zod";
import { profileSchema } from "../../entities/profile";

export const createProfileResponseSchema = z.object({
  data: profileSchema,
});

export type CreateProfileResponse = z.infer<typeof createProfileResponseSchema>;
