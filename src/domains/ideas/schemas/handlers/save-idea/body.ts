import { z } from "@/lib/zod";

export const saveIdeaBodySchema = z
  .object({
    saved: z.boolean(),
  })
  .meta({
    title: "Save idea body",
    description: "Save idea body description",
    ref: "SaveIdeaBodySchema",
  });

export type SaveIdeaBody = z.infer<typeof saveIdeaBodySchema>;
