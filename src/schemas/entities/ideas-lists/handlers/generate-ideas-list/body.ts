import * as z from "zod";

import { ideasListsRegistry } from "../../registry";

export const generateIdeasListBodySchema = z
  .object({
    count: z.number().int().min(1).max(20).optional(),
  })
  .register(ideasListsRegistry, {
    title: "Generate ideas list body",
    description: "Generate ideas list body description",
    ref: "GenerateIdeasListBodySchema",
  });

export type GenerateIdeasListBody = z.infer<typeof generateIdeasListBodySchema>;
