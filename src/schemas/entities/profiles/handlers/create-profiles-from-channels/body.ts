import { z } from "@/lib/zod";

export const createProfilesFromChannelsBodySchema = z
  .object({
    channelUrls: z.array(z.url()),
  })
  .meta({
    title: "Create profiles from channels body",
    description: "Create profiles from channels body description",
    ref: "CreateProfilesFromChannelsBodySchema",
  });

export type CreateProfilesFromChannelsBody = z.infer<
  typeof createProfilesFromChannelsBodySchema
>;
