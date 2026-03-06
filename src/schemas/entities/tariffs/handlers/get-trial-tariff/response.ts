import * as z from "zod";

import { tariffExtendedSchema } from "../../entities/tariff";
import { tariffsRegistry } from "../../registry";

export const getTrialTariffResponseSchema = z
  .object({
    data: tariffExtendedSchema,
  })
  .register(tariffsRegistry, {
    title: "Get trial tariff response",
    description: "Get trial tariff response description",
    ref: "GetTrialTariffResponseSchema",
  });

export type GetTrialTariffResponse = z.infer<
  typeof getTrialTariffResponseSchema
>;
