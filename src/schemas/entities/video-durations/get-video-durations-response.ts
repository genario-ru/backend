import { z } from "zod";

import { videoDurationSchema } from "./entities";

export const getVideoDurationsResponseSchema = z.object({
  data: z.array(videoDurationSchema),
});

export type GetVideoDurationsResponse = z.infer<
  typeof getVideoDurationsResponseSchema
>;