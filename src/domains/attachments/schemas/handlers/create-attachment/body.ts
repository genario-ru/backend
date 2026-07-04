import { z } from "@/lib/zod";

export const createAttachmentBodySchema = z
  .object({
    file: z.file().min(1),
  })
  .meta({
    title: "Create attachment body",
    description: "Create attachment body description",
    ref: "CreateAttachmentBodySchema",
  });

export type CreateAttachmentBody = z.infer<typeof createAttachmentBodySchema>;
