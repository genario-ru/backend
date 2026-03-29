import { createSelectSchema } from "drizzle-zod";

import { payment } from "@/db/schemas/billing/payment";
import { z } from "@/lib/zod";

import { paymentMethodSchema } from "./payment-method";

export const paymentSchema = createSelectSchema(payment).meta({
  title: "Payment method",
  description: "Payment description",
  ref: "PaymentSchema",
});

export type Payment = z.infer<typeof paymentSchema>;

export const paymentExtendedSchema = paymentSchema
  .extend({
    paymentMethod: paymentMethodSchema,
  })
  .meta({
    title: "Payment extended",
    description: "Payment extended description",
    ref: "PaymentExtendedSchema",
  });

export type PaymentExtended = z.infer<typeof paymentExtendedSchema>;
