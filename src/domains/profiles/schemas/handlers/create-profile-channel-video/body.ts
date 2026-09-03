import { z } from "@/lib/zod";

export const createProfileChannelVideoBodySchema = z
  .object({
    url: z.url(),
  })
  .meta({
    title: "Create profile channel video body",
    description: "Create profile channel video body description",
    ref: "CreateProfileChannelVideoBodySchema",
  });

export type CreateProfileChannelVideoBody = z.infer<
  typeof createProfileChannelVideoBodySchema
>;
