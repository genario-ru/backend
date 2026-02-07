import * as z from "zod";

import { ideasListsRegistry } from "../../registry";

export const generateIdeasListResponseSchema = z
  .object({
    data: z.object({
      jobId: z.string(),
      status: z.literal("queued"),
    }),
  })
  .register(ideasListsRegistry, {
    title: "Generate ideas list response",
    description: "Generate ideas list response description",
    ref: "GenerateIdeasListResponseSchema",
  });

export type GenerateIdeasListResponse = z.infer<
  typeof generateIdeasListResponseSchema
>;
