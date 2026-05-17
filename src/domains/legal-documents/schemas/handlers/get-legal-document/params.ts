import { z } from "@/lib/zod";

export const getLegalDocumentParamsSchema = z.object({
  slug: z.string().trim().min(1),
});

export type GetLegalDocumentParams = z.infer<
  typeof getLegalDocumentParamsSchema
>;
