import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { tariffDiscount } from "@/db/schema";

import { userSchema } from "../../users/entities/user";
import { tariffsRegistry } from "../registry";
import { tariffSchema } from "./tariff";

export const tariffDiscountSchema = createSelectSchema(tariffDiscount).register(
  tariffsRegistry,
  {
    title: "Tariff discount",
    description: "Tariff discount description",
    ref: "TariffDiscountSchema",
  },
);

export type TariffDiscount = z.infer<typeof tariffDiscountSchema>;

export const tariffDiscountExtendedSchema = tariffDiscountSchema
  .extend({
    user: userSchema,
    tariff: tariffSchema,
  })
  .register(tariffsRegistry, {
    title: "Tariff discount extended",
    description: "Tariff discount extended description",
    ref: "TariffDiscountExtendedSchema",
  });
