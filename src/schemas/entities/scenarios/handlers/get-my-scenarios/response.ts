import { z } from "@/lib/zod";

import { scenarioSchema } from "../../entities/scenario";
import { scenariosRegistry } from "../../registry";

export const getMyScenariosResponseSchema = z
  .object({
    data: z.array(scenarioSchema),
  })
  .register(scenariosRegistry, {
    title: "Get my scenarios response",
    description: "Get my scenarios response description",
    ref: "GetMyScenariosResponseSchema",
  });

export type GetMyScenariosResponse = z.infer<
  typeof getMyScenariosResponseSchema
>;
