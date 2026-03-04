import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { creditsBatch } from "@/db/schema";

import { creditsRegistry } from "../registry";

export const creditsBatchSchema = createSelectSchema(creditsBatch).register(
  creditsRegistry,
  {
    title: "Credits batch",
    description: "Credits batch description",
    ref: "CreditsBatchSchema",
  },
);

export type CreditsBatch = z.infer<typeof creditsBatchSchema>;
