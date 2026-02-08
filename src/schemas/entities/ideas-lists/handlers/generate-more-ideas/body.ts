import * as z from "zod";

import { ideasListsRegistry } from "../../registry";

export const generateMoreIdeasBodySchema = z
  .object({
    userPrompt: z.string().nullish(),
  })
  .register(ideasListsRegistry, {
    title: "Generate more ideas body",
    description: "Generate more ideas body description",
    ref: "GenerateMoreIdeasBodySchema",
  });

export type GenerateMoreIdeasBody = z.infer<typeof generateMoreIdeasBodySchema>;
