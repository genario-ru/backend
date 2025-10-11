import { z } from "zod";
import { profileExtendedSchema } from "../../entities/profile";

export const getMyProfilesResponseSchema = z.object({
  data: z.array(profileExtendedSchema),
});

export type GetMyProfilesResponse = z.infer<typeof getMyProfilesResponseSchema>;
