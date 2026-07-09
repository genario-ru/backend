import { z } from "@/lib/zod";

export const deleteProfileChannelVideoParamsSchema = z.object({
  profileChannelVideoId: z.uuid(),
});

export type DeleteProfileChannelVideoParams = z.infer<
  typeof deleteProfileChannelVideoParamsSchema
>;
