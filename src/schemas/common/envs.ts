import { z } from "@/lib/zod";

export const envsSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]),
  POSTGRES_URL: z.string(),
  REDIS_URL: z.string(),
  S3_BUCKET_BASE_URL: z.string(),
  S3_BUCKET_NAME: z.string(),
  S3_REGION: z.string(),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_ACCESS_KEY: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),
  POLZA_AI_BASE_URL: z.string(),
  POLZA_AI_API_KEY: z.string(),
  POLZA_AI_STRUCTURED_OUTPUT_MODEL: z.string(),
  POLZA_AI_IMAGE_MODEL: z.string(),
  ROUTER_AI_BASE_URL: z.string(),
  ROUTER_AI_API_KEY: z.string(),
  ROUTER_AI_STRUCTURED_OUTPUT_MODEL: z.string(),
  ROUTER_AI_IMAGE_MODEL: z.string(),
  VSELLM_BASE_URL: z.string(),
  VSELLM_API_KEY: z.string(),
  VSELLM_STRUCTURED_OUTPUT_MODEL: z.string(),
  VSELLM_IMAGE_MODEL: z.string(),
  TOCHKA_OPENAPI_URL: z.string(),
  TOCHKA_BASE_API_URL: z.string(),
  TOCHKA_JWT_TOKEN: z.string(),
  FRONTEND_BASE_URL: z.string(),
  BACKEND_BASE_URL: z.string(),
});

export type EnvsSchema = z.infer<typeof envsSchema>;
