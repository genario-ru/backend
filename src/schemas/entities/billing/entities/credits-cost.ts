import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { creditsCost } from "@/db/schema";

import { billingRegistry } from "../registry";

export const creditsCostSchema = createSelectSchema(creditsCost).register(
  billingRegistry,
  {
    title: "Credits cost",
    description: "Credits cost description",
    ref: "CreditsCostSchema",
  },
);

export type CreditsCost = z.infer<typeof creditsCostSchema>;
