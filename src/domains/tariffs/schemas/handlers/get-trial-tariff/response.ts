import { z } from "@/lib/zod";

import { tariffExtendedSchema } from "../../entities/tariff";

export const getTrialTariffResponseSchema = z
  .object({
    data: tariffExtendedSchema,
  })
  .meta({
    title: "Get trial tariff response",
    description: "Get trial tariff response description",
    ref: "GetTrialTariffResponseSchema",
  });

export type GetTrialTariffResponse = z.infer<
  typeof getTrialTariffResponseSchema
>;
