import { createSelectSchema } from "drizzle-zod";

import { ideasListExport } from "@/db/schema";
import { z } from "@/lib/zod";

export const ideasListExportSchema = createSelectSchema(ideasListExport).meta({
  title: "Ideas list export",
  description: "Ideas list export description",
  ref: "IdeasListExportSchema",
});

export type IdeasListExport = z.infer<typeof ideasListExportSchema>;

export const ideasListExportWithUrlSchema = ideasListExportSchema
  .extend({
    url: z.string().nullable(),
  })
  .meta({
    title: "Ideas list export with url",
    description: "Ideas list export with url description",
    ref: "IdeasListExportWithUrlSchema",
  });

export type IdeasListExportWithUrl = z.infer<
  typeof ideasListExportWithUrlSchema
>;
