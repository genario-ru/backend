import "dotenv/config";

import { envsSchema } from "@/shared/schemas/common/envs";

export const envs = envsSchema.parse({
  // Env
  NODE_ENV: process.env.NODE_ENV,

  // Storage
  POSTGRES_URL: process.env.POSTGRES_URL,
  REDIS_URL: process.env.REDIS_URL,

  // S3
  S3_BUCKET_BASE_URL: process.env.S3_BUCKET_BASE_URL,
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
  S3_REGION: process.env.S3_REGION,
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,

  // Auth
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,

  // Polza AI
  POLZA_AI_BASE_URL: process.env.POLZA_AI_BASE_URL,
  POLZA_AI_API_KEY: process.env.POLZA_AI_API_KEY,
  POLZA_AI_STRUCTURED_OUTPUT_MODEL:
    process.env.POLZA_AI_STRUCTURED_OUTPUT_MODEL,
  POLZA_AI_IMAGE_MODEL: process.env.POLZA_AI_IMAGE_MODEL,

  // Router AI
  ROUTER_AI_BASE_URL: process.env.ROUTER_AI_BASE_URL,
  ROUTER_AI_API_KEY: process.env.ROUTER_AI_API_KEY,
  ROUTER_AI_STRUCTURED_OUTPUT_MODEL:
    process.env.ROUTER_AI_STRUCTURED_OUTPUT_MODEL,
  ROUTER_AI_IMAGE_MODEL: process.env.ROUTER_AI_IMAGE_MODEL,

  // VseLLM
  VSELLM_BASE_URL: process.env.VSELLM_BASE_URL,
  VSELLM_API_KEY: process.env.VSELLM_API_KEY,
  VSELLM_STRUCTURED_OUTPUT_MODEL: process.env.VSELLM_STRUCTURED_OUTPUT_MODEL,
  VSELLM_IMAGE_MODEL: process.env.VSELLM_IMAGE_MODEL,

  // Tochka
  TOCHKA_OPENAPI_URL: process.env.TOCHKA_OPENAPI_URL,
  TOCHKA_BASE_API_URL: process.env.TOCHKA_BASE_API_URL,
  TOCHKA_JWT_TOKEN: process.env.TOCHKA_JWT_TOKEN,

  // YooKassa
  YOOKASSA_OPENAPI_URL: process.env.YOOKASSA_OPENAPI_URL,
  YOOKASSA_BASE_URL: process.env.YOOKASSA_BASE_URL,
  YOOKASSA_SECRET_KEY: process.env.YOOKASSA_SECRET_KEY,
  YOOKASSA_SHOP_ID: process.env.YOOKASSA_SHOP_ID,

  // Youtube
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,

  // RuTube (неофициальный публичный API)
  RUTUBE_BASE_API_URL: process.env.RUTUBE_BASE_API_URL,

  // Web urls
  FRONTEND_BASE_URL: process.env.FRONTEND_BASE_URL,
  BACKEND_BASE_URL: process.env.BACKEND_BASE_URL,

  // SMTP
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_SECURE: process.env.SMTP_SECURE,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  SMTP_FROM: process.env.SMTP_FROM,
});
