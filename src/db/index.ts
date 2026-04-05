import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { envs } from "@/shared/constants/common/envs";

import * as schema from "./schema";

const pool = new Pool({ connectionString: envs.POSTGRES_URL });

export const db = drizzle({
  client: pool,
  casing: "snake_case",
  schema,
});

export { schema };
