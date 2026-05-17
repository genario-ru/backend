import { z } from "@/lib/zod";

import { legalDocumentSchema } from "../../entities/legal-document";

export const getLegalDocumentsResponseSchema = z
  .object({
    data: z.array(legalDocumentSchema),
  })
  .meta({
    title: "Get legal documents response",
    description: "Get legal documents response description",
    ref: "GetLegalDocumentsResponseSchema",
  });

export type GetLegalDocumentsResponse = z.infer<
  typeof getLegalDocumentsResponseSchema
>;
