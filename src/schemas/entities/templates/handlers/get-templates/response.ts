import { z } from "@/lib/zod";

import { templateSchema } from "../../entities/template";
export const getTemplatesResponseSchema = z
  .object({
    data: z.array(templateSchema),
  })
  .meta({
    title: "Get templates response",
    description: "Get templates response description",
    ref: "GetTemplatesResponseSchema",
  });

export type GetTemplatesResponse = z.infer<typeof getTemplatesResponseSchema>;
