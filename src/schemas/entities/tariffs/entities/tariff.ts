import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { tariff } from "@/db/schema";

import { tariffsRegistry } from "../registry";

export const tariffSchema = createSelectSchema(tariff).register(
  tariffsRegistry,
  {
    title: "Tariff",
    description: "Tariff description",
    ref: "TariffSchema",
  },
);

export type Tariff = z.infer<typeof tariffSchema>;
