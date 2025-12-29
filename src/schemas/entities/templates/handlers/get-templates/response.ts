import * as z from "zod";

import { templateSchema } from "../../entities/template";
import { templatesRegistry } from "../../registry";

export const getTemplatesResponseSchema = z
  .object({
    data: z.array(templateSchema),
  })
  .register(templatesRegistry, {
    title: "Get templates response",
    description: "Get templates response description",
    ref: "GetTemplatesResponseSchema",
  });

export type GetTemplatesResponse = z.infer<typeof getTemplatesResponseSchema>;
