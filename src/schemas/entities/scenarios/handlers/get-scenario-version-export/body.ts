import { z } from "@/lib/zod";

export const getScenarioVersionExportBodySchema = z.object({
  format: z.enum(["pdf", "docx"]),
});

export type GetScenarioVersionExportBody = z.infer<
  typeof getScenarioVersionExportBodySchema
>;
