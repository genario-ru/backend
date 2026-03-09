import { z } from "@/lib/zod";

export const getProfileParamsSchema = z
  .object({
    profileId: z.uuid(),
  })
  .meta({
    title: "Get profile params",
    description: "Get profile params description",
    ref: "GetProfileParamsSchema",
  });

export type GetProfileParams = z.infer<typeof getProfileParamsSchema>;
