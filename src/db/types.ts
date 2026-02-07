import type { ExtractTablesWithRelations } from "drizzle-orm";
import {
  NodePgDatabase,
  type NodePgQueryResultHKT,
} from "drizzle-orm/node-postgres";
import { PgTransaction } from "drizzle-orm/pg-core";
import { Pool } from "pg";

import * as schema from "./schema";

export type DB = NodePgDatabase<typeof schema> & {
  $client: Pool;
};

export type Transaction = PgTransaction<
  NodePgQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

export type OmitTimestamps<
  T extends {
    updatedAt: Date | string;
    createdAt: Date | string;
  },
> = Omit<T, "updatedAt" | "createdAt">;
