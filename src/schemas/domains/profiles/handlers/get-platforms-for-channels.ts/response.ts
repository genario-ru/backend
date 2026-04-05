import { z } from "@/lib/zod";
import { platformSchema } from "@/schemas/domains/platforms/entities/platform";

export const getPlatformsForChannelsResponseSchema = z
  .object({
    data: z.array(platformSchema),
  })
  .meta({
    title: "Get platforms for channels response",
    description: "Get platforms for channels response description",
    ref: "GetPlatformsForChannelsResponseSchema",
  });

export type GetPlatformsForChannelsResponse = z.infer<
  typeof getPlatformsForChannelsResponseSchema
>;
