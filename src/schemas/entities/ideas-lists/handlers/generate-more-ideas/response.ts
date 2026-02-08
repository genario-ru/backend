import * as z from "zod";

import { ideasListSchema } from "../../entities/ideas-list";
import { ideasListsRegistry } from "../../registry";

export const generateMoreIdeasResponseSchema = z
  .object({
    data: ideasListSchema,
  })
  .register(ideasListsRegistry, {
    title: "Generate more ideas response",
    description: "Generate more ideas response description",
    ref: "GenerateMoreIdeasResponseSchema",
  });

export type GenerateMoreIdeasResponse = z.infer<
  typeof generateMoreIdeasResponseSchema
>;
