import { z } from "@/lib/zod";

import { legalDocumentExtendedSchema } from "../../entities/legal-document";

export const getLegalDocumentResponseSchema = z
  .object({
    data: legalDocumentExtendedSchema,
  })
  .meta({
    title: "Get legal document response",
    description: "Get legal document response description",
    ref: "GetLegalDocumentResponseSchema",
  });

export type GetLegalDocumentResponse = z.infer<
  typeof getLegalDocumentResponseSchema
>;
