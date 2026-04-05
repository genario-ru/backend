import { createSelectSchema } from "drizzle-zod";

import { tariff } from "@/db/schema";
import { creditsPackageSchema } from "@/domains/credits/schemas/entities/credits-package";
import { z } from "@/lib/zod";

import { tariffFeature } from "./tariff-feature";

export const tariffSchema = createSelectSchema(tariff).meta({
  title: "Tariff",
  description: "Tariff description",
  ref: "TariffSchema",
});

export type Tariff = z.infer<typeof tariffSchema>;

export const tariffExtendedSchema = tariffSchema
  .extend({
    creditsPackage: creditsPackageSchema.nullish(),
    features: z.array(tariffFeature),
  })
  .meta({
    title: "Tariff extended",
    description: "Tariff extended description",
    ref: "TariffExtendedSchema",
  });

export type TariffExtended = z.infer<typeof tariffExtendedSchema>;
