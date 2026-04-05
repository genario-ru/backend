import { defineConfig } from "drizzle-kit";

import { envs } from "@/shared/constants/common/envs";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: envs.POSTGRES_URL },
});
