import { scenarioExtendedSchema } from "@/domains/scenarios/schemas/entities/scenario";
import { z } from "@/lib/zod";
import { responseMetaSchema } from "@/shared/schemas/common/meta";

export const getMyScenariosResponseMetaSchema = responseMetaSchema
  .omit({ sortBy: true, sortOrder: true })
  .extend({
    sort: z.string(),
  })
  .meta({
    title: "Get my scenarios response meta",
    description: "Get my scenarios response meta description",
    ref: "GetMyScenariosResponseMetaSchema",
  });

export type GetMyScenariosResponseMeta = z.infer<
  typeof getMyScenariosResponseMetaSchema
>;

export const getMyScenariosResponseSchema = z
  .object({
    data: z.array(scenarioExtendedSchema),
    meta: getMyScenariosResponseMetaSchema,
  })
  .meta({
    title: "Get my scenarios response",
    description: "Scenarios response payload",
    ref: "GetMyScenariosResponseSchema",
  });

export type GetMyScenariosResponse = z.infer<
  typeof getMyScenariosResponseSchema
>;
