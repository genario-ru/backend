import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { tariff } from "@/db/schema";

import { tariffsRegistry } from "../registry";
import { tariffTrialSchema } from "./tariff-trial";

export const tariffSchema = createSelectSchema(tariff).register(
  tariffsRegistry,
  {
    title: "Tariff",
    description: "Tariff description",
    ref: "TariffSchema",
  },
);

export type Tariff = z.infer<typeof tariffSchema>;

export const tariffExtendedSchema = tariffSchema.extend({
  trial: tariffTrialSchema.nullish(),
});

export type TariffExtended = z.infer<typeof tariffExtendedSchema>;
