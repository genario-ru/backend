import { z } from "@/lib/zod";

import { scenarioSchema } from "../../entities/scenario";

export const getMyScenariosResponseSchema = z
  .object({
    data: z.array(scenarioSchema),
  })
  .meta({
    title: "Get my scenarios response",
    description: "Get my scenarios response description",
    ref: "GetMyScenariosResponseSchema",
  });

export type GetMyScenariosResponse = z.infer<
  typeof getMyScenariosResponseSchema
>;
