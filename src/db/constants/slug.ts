import { text } from "drizzle-orm/pg-core";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 12);

// ВАЖНО: это фабрика, а НЕ общий объект. `.unique()` создаёт именованный
// констрейнт, а drizzle выводит его имя из таблицы и мемоизирует на инстансе
// билдера. Если переиспользовать один и тот же объект (`...uniqueSlug`) в
// нескольких таблицах, все они получат одно имя констрейнта (по первой таблице),
// и единый squash-миграционный файл упадёт на `relation "..._slug_unique"
// already exists`. Фабрика отдаёт свежий билдер на каждую таблицу → имена
// уникальны (`<table>_slug_unique`).
export const uniqueSlug = () => ({
  slug: text("slug")
    .unique()
    .notNull()
    .$default(() => nanoid()),
});
