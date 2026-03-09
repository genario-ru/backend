import { z } from "@/lib/zod";

export const getProfileParamsSchema = z.object({
  profileId: z.uuid(),
});

export type GetProfileParams = z.infer<typeof getProfileParamsSchema>;
