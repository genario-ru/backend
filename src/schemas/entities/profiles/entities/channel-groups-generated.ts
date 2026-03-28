import { z } from "@/lib/zod";

export const channelGroupsGeneratedSchema = z.object({
  groups: z.array(z.array(z.number().int().nonnegative())),
});

export type ChannelGroupsGenerated = z.infer<
  typeof channelGroupsGeneratedSchema
>;
