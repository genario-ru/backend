import { z } from "@/lib/zod";

import { healthCheckSchema } from "../../entities/health-check";

export const getHealthResponseSchema = z
  .object({
    status: z.enum(["ok", "unhealthy"]),
    checks: z.object({
      postgres: healthCheckSchema,
      redis: healthCheckSchema,
    }),
  })
  .meta({
    title: "Get health response",
    description: "Aggregated readiness status for core backend dependencies",
    ref: "GetHealthResponseSchema",
  });

export type GetHealthResponse = z.infer<typeof getHealthResponseSchema>;
