import { z } from "@/lib/zod";

export const updateProfileParamsSchema = z.object({
  profileId: z.uuid(),
});

export type UpdateProfileParams = z.infer<typeof updateProfileParamsSchema>;
