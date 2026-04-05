import { z } from "@/lib/zod";

export const saveScenarioBodySchema = z
  .object({
    saved: z.boolean(),
  })
  .meta({
    title: "Save scenario body",
    description: "Save scenario body description",
    ref: "SaveScenarioBodySchema",
  });

export type SaveScenarioBody = z.infer<typeof saveScenarioBodySchema>;
