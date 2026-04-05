import { z } from "@/lib/zod";

export const healthCheckSchema = z
  .object({
    status: z.enum(["ok", "error"]),
    latencyMs: z.number().int().nonnegative().optional(),
  })
  .meta({
    title: "Health check",
    description: "Result of a single infrastructure dependency probe",
    ref: "HealthCheckSchema",
  });

export type HealthCheck = z.infer<typeof healthCheckSchema>;
