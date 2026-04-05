import { z } from "@/lib/zod";

import { ideasListSchema } from "../../entities/ideas-list";
export const generateMoreIdeasResponseSchema = z
  .object({
    data: ideasListSchema,
  })
  .meta({
    title: "Generate more ideas response",
    description: "Generate more ideas response description",
    ref: "GenerateMoreIdeasResponseSchema",
  });

export type GenerateMoreIdeasResponse = z.infer<
  typeof generateMoreIdeasResponseSchema
>;
