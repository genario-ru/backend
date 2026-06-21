import { z } from "@/lib/zod";

export const createApplicationBodySchema = z
  .object({
    email: z.email().transform((email) => email.toLowerCase()),
    featureIds: z.array(z.uuid()).optional().default([]),
    comment: z.string().max(4096).optional(),
    marketingAccepted: z.boolean().optional().default(false),
  })
  .meta({
    title: "Create application body",
    description: "Create application body description",
    ref: "CreateApplicationBodySchema",
  });

export type CreateApplicationBody = z.infer<typeof createApplicationBodySchema>;
