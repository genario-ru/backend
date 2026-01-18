import * as z from "zod";

import { ideasRegistry } from "../../registry";

export const saveIdeaBodySchema = z
  .object({
    saved: z.boolean(),
  })
  .register(ideasRegistry, {
    title: "Save idea body",
    description: "Save idea body description",
    ref: "SaveIdeaBodySchema",
  });

export type SaveIdeaBody = z.infer<typeof saveIdeaBodySchema>;
