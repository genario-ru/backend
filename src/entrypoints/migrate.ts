import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import { sql } from "drizzle-orm";
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

/** Возвращает host/db из POSTGRES_URL без утечки пароля — для диагностики. */
function describeDbTarget(): string {
  const url = process.env.POSTGRES_URL;
  if (!url) return "POSTGRES_URL не задан";
  try {
    const parsed = new URL(url);
    return `${parsed.host}${parsed.pathname}`;
  } catch {
    return "POSTGRES_URL задан, но не парсится как URL";
  }
}

const absoluteFolder = resolve(MIGRATIONS_FOLDER);

console.log(`📁 cwd: ${process.cwd()}`);
console.log(`📁 Папка миграций: ${absoluteFolder}`);
console.log(`🎯 Цель (host/db): ${describeDbTarget()}`);

if (!existsSync(absoluteFolder)) {
  console.error(`❌ Папка миграций не найдена: ${absoluteFolder}`);
  process.exit(1);
}

const sqlFiles = readdirSync(absoluteFolder).filter((file) =>
  file.endsWith(".sql"),
);
console.log(`📄 SQL-файлов найдено: ${sqlFiles.length}`);

const { db, pool } = createStandaloneClient();

try {
  await db.execute(sql`select 1`);
  console.log("✅ Подключение к базе установлено.");

  console.log("🚀 Применяю миграции...");
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  console.log("✅ Миграции успешно применены.");
} catch (error) {
  console.error("❌ Не удалось применить миграции.");
  if (error instanceof Error) {
    console.error(`Причина: ${error.message}`);
    console.error(error.stack);
  } else {
    console.error(error);
  }
  await pool.end();
  process.exit(1);
}

await pool.end();
process.exit(0);
