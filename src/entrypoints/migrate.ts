import { migrate } from "drizzle-orm/node-postgres/migrator";

import { createStandaloneClient } from "@/db/utils/standalone-client";

/**
 * Программное применение SQL-миграций в проде.
 *
 * В рантайм-образе нет `drizzle-kit` (он вырезается `pnpm prune --production`),
 * поэтому CLI `drizzle-kit migrate` недоступен. Используем `migrate()` из
 * `drizzle-orm`, который читает SQL-файлы из папки миграций.
 *
 * Путь указан относительно cwd: локально (tsx) это корень репозитория, а в
 * контейнере — `/app`, куда Dockerfile копирует `src/db/migrations`.
 */
const MIGRATIONS_FOLDER = "src/db/migrations";

const { db, pool } = createStandaloneClient();

try {
  console.log("🚀 Применяю миграции базы данных...");
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  console.log("✅ Миграции успешно применены.");
} catch (error) {
  console.error("❌ Не удалось применить миграции:", error);
  await pool.end();
  process.exit(1);
}

await pool.end();
process.exit(0);
