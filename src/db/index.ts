import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import "dotenv/config";

import * as schema from "./schema";

const pool = new Pool({ connectionString: process.env.POSTGRES_URL! });

export const db = drizzle({
  client: pool,
  casing: "snake_case",
  schema,
});

export { schema };
