import { z } from "@/lib/zod";

export const getScenarioVersionExportBodySchema = z.object({
  format: z.string(),
});

export type GetScenarioVersionExportBody = z.infer<
  typeof getScenarioVersionExportBodySchema
>;
