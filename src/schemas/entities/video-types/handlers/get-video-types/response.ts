import * as z from "zod";

import { videoTypeSchema } from "../../entities/video-type";
import { videoTypesRegistry } from "../../registry";

export const getVideoTypesResponseSchema = z
  .object({
    data: z.array(videoTypeSchema),
  })
  .register(videoTypesRegistry, {
    title: "Get video types response",
    description: "Get video types response description",
    ref: "GetVideoTypesResponseSchema",
  });

export type GetVideoTypesResponse = z.infer<typeof getVideoTypesResponseSchema>;
