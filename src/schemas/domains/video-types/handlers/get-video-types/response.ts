import * as z from "zod";

import { videoTypeSchema } from "../entities/video-type";

export const getVideoTypesResponseSchema = z.object({
  data: z.array(videoTypeSchema),
});

export type GetVideoTypesResponse = z.infer<typeof getVideoTypesResponseSchema>;
