import { z } from "@/lib/zod";

export const paymentRequiredResponseSchema = z.string().meta({
  title: "Payment required response",
  description: "Payment required response description",
  examples: ["Active subscription or sufficient credits are required"],
  ref: "PaymentRequiredResponseSchema",
});
