import * as z from "zod";

import { scenarioSchema } from "../../entities/scenario";

export const getMyScenariosResponseSchema = z.object({
  data: z.array(scenarioSchema),
});

export type GetMyScenariosResponse = z.infer<
  typeof getMyScenariosResponseSchema
>;
