import { z } from "@/lib/zod";

export const createProfilesFromChannelUrlsBodySchema = z
  .object({
    channelUrls: z.array(z.url()),
  })
  .meta({
    title: "Create profiles from channel urls body",
    description: "Create profiles from channel urls body description",
    ref: "CreateProfilesFromChannelUrlsBodySchema",
  });

export type CreateProfilesFromChannelUrlsBody = z.infer<
  typeof createProfilesFromChannelUrlsBodySchema
>;
