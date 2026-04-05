import { createSelectSchema } from "drizzle-zod";

import { paymentMethod } from "@/db/schemas/billing/payment-method";
import { z } from "@/lib/zod";

// Override jsonb: drizzle-zod's default record breaks Zod 4 toJSONSchema (OpenAPI).
export const paymentMethodSchema = createSelectSchema(paymentMethod, {
  data: z.unknown().nullable(),
}).meta({
  title: "Payment method",
  description: "Payment method description",
  ref: "PaymentMethodSchema",
});

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
