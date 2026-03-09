import { z } from "@/lib/zod";

import { tariffExtendedSchema } from "../../entities/tariff";
import { tariffsRegistry } from "../../registry";

export const getTariffsResponseSchema = z
  .object({
    data: z.array(tariffExtendedSchema),
  })
  .register(tariffsRegistry, {
    title: "Get tariffs response",
    description: "Get tariffs response description",
    ref: "GetTariffsResponseSchema",
  });

export type GetTariffsResponse = z.infer<typeof getTariffsResponseSchema>;
