import { text } from "drizzle-orm/pg-core";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 12);

export const uniqueSlug = {
  slug: text("slug")
    .unique()
    .notNull()
    .$default(() => nanoid()),
};
