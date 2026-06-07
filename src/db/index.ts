import { env } from "@/env";

import * as schema from "./schema";
import { createDBClient } from "./utils/create-db-client";

const { db } = createDBClient({ connectionString: env.POSTGRES_URL });

export { db, schema };
