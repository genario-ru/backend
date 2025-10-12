import * as z from "zod";

import { templateSchema } from "../../entities/template";


export const getTemplatesResponseSchema = z.object({
  data: z.array(templateSchema),
});

export type GetTemplatesResponse = z.infer<typeof getTemplatesResponseSchema>;
