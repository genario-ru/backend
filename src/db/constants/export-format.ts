import { pgEnum } from "drizzle-orm/pg-core";

export const exportFormat = pgEnum("export_format", ["pdf", "docx"]);
