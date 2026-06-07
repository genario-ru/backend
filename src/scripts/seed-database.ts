#!/usr/bin/env tsx

import { seedDefaultData } from "@/db/seed";
import { createDBClient } from "@/db/utils/create-db-client";
import { env } from "@/env";

/**
 * Локальный скрипт: заливает дефолтные (reference) данные из `data/*.json` в БД.
 *
 * Идемпотентно: upsert по первичному ключу `id` (см. `src/db/seed/index.ts`).
 * Запускается отдельной командой (`pnpm db:seed`) и не входит в продакшен-сборку
 * — на сервере сид не выполняется. Поэтому берём `POSTGRES_URL` прямо из
 * валидированного `@/env` (полный набор env доступен локально).
 */
const { db, pool } = createDBClient({ connectionString: env.POSTGRES_URL });

try {
  console.log("🌱 Заливаю дефолтные данные...");
  await seedDefaultData(db);
  console.log("✅ Дефолтные данные успешно записаны.");
} catch (error) {
  console.error("❌ Не удалось записать дефолтные данные:", error);
  await pool.end();
  process.exit(1);
}

await pool.end();
process.exit(0);
