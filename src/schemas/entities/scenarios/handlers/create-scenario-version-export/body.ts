import { z } from "@/lib/zod";

export const createScenarioVersionExportBodySchema = z
  .object({
    format: z.enum(["pdf", "docx"]),
  })
  .meta({
    title: "Create scenario version export body",
    description: "Create scenario version export body description",
    ref: "CreateScenarioVersionExportBodySchema",
  });

export type CreateScenarioVersionExportBody = z.infer<
  typeof createScenarioVersionExportBodySchema
>;
