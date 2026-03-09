import { createSelectSchema } from "drizzle-zod";

import { tariffDiscount } from "@/db/schema";
import { z } from "@/lib/zod";

import { userSchema } from "../../users/entities/user";
import { tariffSchema } from "./tariff";

export const tariffDiscountSchema = createSelectSchema(tariffDiscount).meta({
  title: "Tariff discount",
  description: "Tariff discount description",
  ref: "TariffDiscountSchema",
});

export type TariffDiscount = z.infer<typeof tariffDiscountSchema>;

export const tariffDiscountExtendedSchema = tariffDiscountSchema
  .extend({
    user: userSchema,
    tariff: tariffSchema,
  })
  .meta({
    title: "Tariff discount extended",
    description: "Tariff discount extended description",
    ref: "TariffDiscountExtendedSchema",
  });
