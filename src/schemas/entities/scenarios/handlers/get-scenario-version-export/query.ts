import { z } from "@/lib/zod";

export const getScenarioVersionExportQuerySchema = z.object({
  format: z.enum(["pdf", "docx"]),
});

export type GetScenarioVersionExportQuery = z.infer<
  typeof getScenarioVersionExportQuerySchema
>;
