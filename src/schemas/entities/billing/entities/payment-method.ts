import { createSelectSchema } from "drizzle-zod";

import { paymentMethod } from "@/db/schemas/billing/payment-method";
import { z } from "@/lib/zod";

export const paymentMethodSchema = createSelectSchema(paymentMethod).meta({
  title: "Payment method",
  description: "Payment method description",
  ref: "PaymentMethodSchema",
});

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
