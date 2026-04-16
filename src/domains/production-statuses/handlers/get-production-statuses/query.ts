import { z } from "@/lib/zod";

export const getProductionStatusesQuerySchema = z.object({
  entity: z.enum(["scenario", "scenarioChapter"]),
});

export type GetProductionStatusesQuery = z.infer<
  typeof getProductionStatusesQuerySchema
>;
