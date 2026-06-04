import { createSelectSchema } from "drizzle-zod";

import { payment } from "@/db/schemas/billing/payment";
import { creditsPackageSchema } from "@/domains/credits/schemas/entities/credits-package";
import { tariffSchema } from "@/domains/tariffs/schemas/entities/tariff";
import { z } from "@/lib/zod";

import { paymentMethodSchema } from "./payment-method";

export const paymentSchema = createSelectSchema(payment).meta({
  title: "Payment method",
  description: "Payment description",
  ref: "PaymentSchema",
});

export type Payment = z.infer<typeof paymentSchema>;

export const paymentPublicSchema = paymentSchema
  .omit({
    paymentLink: true,
  })
  .extend({
    paymentMethod: paymentMethodSchema.nullish(),
    tariff: tariffSchema.nullish(),
    creditsPackage: creditsPackageSchema.nullish(),
  })
  .meta({
    title: "Payment extended",
    description: "Payment extended description",
    ref: "PaymentExtendedSchema",
  });

export type PaymentPublic = z.infer<typeof paymentPublicSchema>;
