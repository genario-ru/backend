import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { tariffTrial } from "@/db/schema";

import { tariffsRegistry } from "../registry";

export const tariffTrialSchema = createSelectSchema(tariffTrial).register(
  tariffsRegistry,
  {
    title: "Tariff trial",
    description: "Tariff trial description",
    ref: "TariffTrialSchema",
  },
);

export type TariffTrial = z.infer<typeof tariffTrialSchema>;
