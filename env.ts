import "dotenv/config";

import { createEnv } from "@t3-oss/env-core";

import { z } from "@/lib/zod";
import { ipAllowlistSchema } from "@/shared/schemas/common/ip-allowlist";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "stage", "production"]),
    POSTGRES_URL: z.url(),
    REDIS_URL: z.url(),
    S3_BUCKET_BASE_URL: z.url(),
    S3_BUCKET_NAME: z.string().min(1),
    S3_REGION: z.string().min(1),
    S3_ACCESS_KEY: z.string().min(1),
    S3_SECRET_ACCESS_KEY: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.url(),
    BETTER_AUTH_FIXED_SIGN_IN_OTPS: z.string().optional(),
    DISABLE_SIGN_UP: z.stringbool().default(false),
    POLZA_AI_BASE_URL: z.url(),
    POLZA_AI_API_KEY: z.string().min(1),
    POLZA_AI_STRUCTURED_OUTPUT_MODEL: z.string().min(1),
    POLZA_AI_IMAGE_MODEL: z.string().min(1),
    VSELLM_BASE_URL: z.url(),
    VSELLM_API_KEY: z.string().min(1),
    VSELLM_STRUCTURED_OUTPUT_MODEL: z.string().min(1),
    VSELLM_IMAGE_MODEL: z.string().min(1),
    SOCIALKIT_OPENAPI_URL: z.url(),
    SOCIALKIT_BASE_API_URL: z.url(),
    SOCIALKIT_API_KEY: z.string().min(1),
    YOOKASSA_OPENAPI_URL: z.url(),
    YOOKASSA_BASE_URL: z.url(),
    YOOKASSA_SECRET_KEY: z.string().min(1),
    YOOKASSA_SHOP_ID: z.string().min(1),
    YOOKASSA_IPS: ipAllowlistSchema.optional(),
    SUBSCRIPTIONS_CHARGE_SCHEDULER_ENABLED: z.stringbool().default(false),
    UPCOMING_CHARGES_NEWSLETTER_SCHEDULER_ENABLED: z
      .stringbool()
      .default(false),
    TERMINATE_EXPIRED_CREDITS_BATCHES_SCHEDULER_ENABLED: z
      .stringbool()
      .default(false),
    YOUTUBE_API_KEY: z.string().min(1),
    RUTUBE_BASE_API_URL: z.url(),
    FRONTEND_BASE_URL: z.url(),
    BACKEND_BASE_URL: z.url(),
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.coerce.number().int(),
    SMTP_SECURE: z.stringbool(),
    SMTP_USER: z.string().min(1),
    SMTP_PASSWORD: z.string().min(1),
    SMTP_FROM: z.string().min(1),
    METRICS_ALLOWED_IPS: ipAllowlistSchema.optional(),
    LOCAL_DEVELOPMENT_IPS: ipAllowlistSchema.optional(),
    TRUSTED_PROXY_COUNT: z.coerce.number().int().min(1).default(1),
    GLITCHTIP_DSN: z.url().optional(),
    GLITCHTIP_RELEASE: z.string().min(1).optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
