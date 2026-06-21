import { z } from "@/lib/zod";

import { applicationSchema } from "../../entities/application";

export const createApplicationResponseSchema = z
  .object({
    data: applicationSchema,
  })
  .meta({
    title: "Create application response",
    description: "Create application response description",
    ref: "CreateApplicationResponseSchema",
  });

export type CreateApplicationResponse = z.infer<
  typeof createApplicationResponseSchema
>;
