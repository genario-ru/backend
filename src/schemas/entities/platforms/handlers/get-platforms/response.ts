import * as z from "zod";
import { platformExtendedSchema } from "../../entities/platform";

export const getPlatformsResponseSchema = z.object({
  data: z.array(platformExtendedSchema),
});

export type GetPlatformsResponse = z.infer<typeof getPlatformsResponseSchema>;
