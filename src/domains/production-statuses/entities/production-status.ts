import { createSelectSchema } from "drizzle-zod";

import { productionStatus } from "@/db/schema";
import { z } from "@/lib/zod";

export const productionStatusSchema = createSelectSchema(productionStatus).meta(
  {
    title: "Production status",
    description: "Production status description",
    ref: "ProductionStatusSchema",
  },
);

export type ProductionStatus = z.infer<typeof productionStatusSchema>;
