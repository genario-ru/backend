import { z } from "@/lib/zod";

import { videoDurationSchema } from "../../entities/video-duration";
export const getVideoDurationsResponseSchema = z
  .object({
    data: z.array(videoDurationSchema),
  })
  .meta({
    title: "Get video durations response",
    description: "Get video durations response description",
    ref: "GetVideoDurationsResponseSchema",
  });

export type GetVideoDurationsResponse = z.infer<
  typeof getVideoDurationsResponseSchema
>;
