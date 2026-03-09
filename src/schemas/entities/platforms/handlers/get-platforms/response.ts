import { z } from "@/lib/zod";

import { platformExtendedSchema } from "../../entities/platform";
import { platformsRegistry } from "../../registry";

export const getPlatformsResponseSchema = z
  .object({
    data: z.array(platformExtendedSchema),
  })
  .register(platformsRegistry, {
    title: "Get platforms response",
    description: "Get platforms response description",
    ref: "GetPlatformsResponseSchema",
  });

export type GetPlatformsResponse = z.infer<typeof getPlatformsResponseSchema>;
