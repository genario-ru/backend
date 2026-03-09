import { z } from "@/lib/zod";
import { ideaSchema } from "@/schemas/entities/ideas/entities/idea";

import { ideasListsRegistry } from "../../registry";

export const createIdeaResponseSchema = z
  .object({
    data: ideaSchema,
  })
  .register(ideasListsRegistry, {
    title: "Create idea response",
    description: "Create idea response description",
    ref: "CreateIdeaResponseSchema",
  });

export type CreateIdeaResponse = z.infer<typeof createIdeaResponseSchema>;
