import * as z from "zod";

import { ideaSchema } from "@/schemas/entities/ideas/entities/idea";

import { ideasListsRegistry } from "../../registry";

export const getIdeasResponseSchema = z
  .object({
    data: z.array(ideaSchema),
  })
  .register(ideasListsRegistry, {
    title: "Get ideas response",
    description: "Get ideas response description",
    ref: "GetIdeasResponseSchema",
  });
export type GetIdeasResponse = z.infer<typeof getIdeasResponseSchema>;
