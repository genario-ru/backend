import { z } from "@/lib/zod";

import { platformExtendedSchema } from "../../entities/platform";
export const getPlatformsResponseSchema = z
  .object({
    data: z.array(platformExtendedSchema),
  })
  .meta({
    title: "Get platforms response",
    description: "Get platforms response description",
    ref: "GetPlatformsResponseSchema",
  });

export type GetPlatformsResponse = z.infer<typeof getPlatformsResponseSchema>;
