import { z } from "@/lib/zod";

export const deleteProfileParamsSchema = z
  .object({
    profileId: z.uuid(),
  })
  .meta({
    title: "Delete profile params",
    description: "Delete profile params description",
    ref: "DeleteProfileParamsSchema",
  });

export type DeleteProfileParams = z.infer<typeof deleteProfileParamsSchema>;
