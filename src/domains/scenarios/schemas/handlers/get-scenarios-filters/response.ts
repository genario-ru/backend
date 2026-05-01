import { scenariosFiltersSchema } from "@/domains/scenarios/schemas/entities/scenarios-filter";
import { z } from "@/lib/zod";

export const getScenariosFiltersResponseSchema = z
  .object({
    data: scenariosFiltersSchema,
  })
  .meta({
    title: "Get scenarios filters response",
    description: "Scenarios filters response payload",
    ref: "GetScenariosFiltersResponseSchema",
  });

export type GetScenariosFiltersResponse = z.infer<
  typeof getScenariosFiltersResponseSchema
>;
