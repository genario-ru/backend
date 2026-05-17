import { createSelectSchema } from "drizzle-zod";

import { legalDocument } from "@/db/schema";
import { z } from "@/lib/zod";

export const legalDocumentSchema = createSelectSchema(legalDocument)
  .omit({
    url: true,
  })
  .meta({
    title: "Legal document",
    description: "Legal document description",
    ref: "LegalDocumentSchema",
  });

export type LegalDocument = z.infer<typeof legalDocumentSchema>;

export const legalDocumentExtendedSchema = legalDocumentSchema
  .extend({
    markdown: z.string(),
  })
  .meta({
    title: "Legal document extended",
    description: "Legal document extended description",
    ref: "LegalDocumentExtendedSchema",
  });

export type LegalDocumentExtended = z.infer<typeof legalDocumentExtendedSchema>;
