import "dotenv/config";

export const envs = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  POSTGRES_URL: process.env.POSTGRES_URL,
  REDIS_URL: process.env.REDIS_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  POLZA_AI_BASE_URL: process.env.POLZA_AI_BASE_URL,
  POLZA_AI_API_KEY: process.env.POLZA_AI_API_KEY,
  POLZA_AI_STRUCTURED_OUTPUT_MODEL:
    process.env.POLZA_AI_STRUCTURED_OUTPUT_MODEL,
  POLZA_AI_IMAGE_MODEL: process.env.POLZA_AI_IMAGE_MODEL,
  WEB_APP_BASE_URL: process.env.WEB_APP_BASE_URL,
  LANDING_BASE_URL: process.env.LANDING_BASE_URL,
} as Record<string, string>;
