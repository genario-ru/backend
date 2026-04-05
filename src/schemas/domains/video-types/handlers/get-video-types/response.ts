import { z } from "@/lib/zod";

import { videoTypeSchema } from "../../entities/video-type";
export const getVideoTypesResponseSchema = z
  .object({
    data: z.array(videoTypeSchema),
  })
  .meta({
    title: "Get video types response",
    description: "Get video types response description",
    ref: "GetVideoTypesResponseSchema",
  });

export type GetVideoTypesResponse = z.infer<typeof getVideoTypesResponseSchema>;
