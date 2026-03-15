import { createSelectSchema } from "drizzle-zod";

import { exportDocumentFormat } from "@/db/schema";
import { z } from "@/lib/zod";

export const exportDocumentFormatSchema = createSelectSchema(
  exportDocumentFormat,
).meta({
  title: "Export document format",
  description: "Export document format description",
  ref: "ExportDocumentFormatSchema",
});

export type ExportDocumentFormat = z.infer<typeof exportDocumentFormatSchema>;
