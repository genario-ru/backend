import * as z from "zod";

import { videoDurationSchema } from "../../entities/video-duration";
import { videoDurationsRegistry } from "../../registry";

export const getVideoDurationsResponseSchema = z
  .object({
    data: z.array(videoDurationSchema),
  })
  .register(videoDurationsRegistry, {
    title: "Get video durations response",
    description: "Get video durations response description",
    ref: "GetVideoDurationsResponseSchema",
  });

export type GetVideoDurationsResponse = z.infer<
  typeof getVideoDurationsResponseSchema
>;
