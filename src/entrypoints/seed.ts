import { seedDefaultData } from "@/db/seed";
import { createStandaloneClient } from "@/db/utils/standalone-client";

/**
 * Заливает дефолтные (reference) данные из `data/*.json` в базу.
 *
 * Идемпотентно: upsert по первичному ключу `id` (см. `src/db/seed/index.ts`).
 * Запускается отдельной командой (`pnpm db:seed` локально), не привязан к шагу
 * миграций.
 */
const { db, pool } = createStandaloneClient();

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
