import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "../schema";

type CreateDbClientOptions = {
  connectionString: string;
};

export function createDBClient({ connectionString }: CreateDbClientOptions) {
  const pool = new Pool({ connectionString });

  const db = drizzle({
    client: pool,
    casing: "snake_case",
    schema,
  });

  return { db, pool };
}
