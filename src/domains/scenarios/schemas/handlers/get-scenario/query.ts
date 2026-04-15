import { z } from "@/lib/zod";

export const getScenarioQuerySchema = z.object({
  versionId: z.uuid().optional(),
});

export type GetScenarioQuery = z.infer<typeof getScenarioQuerySchema>;
