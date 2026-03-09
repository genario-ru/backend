import { createSelectSchema } from "drizzle-zod";

import { creditsBatch } from "@/db/schema";
import { z } from "@/lib/zod";

export const creditsBatchSchema = createSelectSchema(creditsBatch).meta({
  title: "Credits batch",
  description: "Credits batch description",
  ref: "CreditsBatchSchema",
});

export type CreditsBatch = z.infer<typeof creditsBatchSchema>;
