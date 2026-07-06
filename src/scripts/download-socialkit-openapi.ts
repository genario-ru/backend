#!/usr/bin/env tsx
/* eslint-disable security/detect-non-literal-fs-filename */

import { existsSync, mkdirSync, writeFileSync } from "fs";
import { openapiFilter } from "openapi-format";
import { join } from "path";
import YAML from "yaml";

import { env } from "@/env";

// ====================== НАСТРОЙКИ ======================

const OUTPUT_DIR = "deps/api";
const FINAL_FILENAME = "socialkit.json";
const TARGET_TAGS = ["YouTube", "Instagram", "TikTok"];
const DOWNLOAD_URL = env.SOCIALKIT_OPENAPI_URL;

// ====================== ОСНОВНАЯ ЛОГИКА ======================

async function main() {
  const outputDirPath = join(process.cwd(), OUTPUT_DIR);
  const finalPath = join(outputDirPath, FINAL_FILENAME);

  try {
    console.log(`📥 Скачиваю OpenAPI SocialKit...`);

    const res = await fetch(DOWNLOAD_URL);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const yamlText = await res.text();
    const spec = YAML.parse(yamlText);

    console.log(`🧹 Фильтрую по тегам "${TARGET_TAGS}" + очищаю компоненты...`);

    const filtered = await openapiFilter(spec, {
      filterSet: {
        inverseTags: TARGET_TAGS,
        unusedComponents: [
          "schemas",
          "parameters",
          "requestBodies",
          "responses",
          "examples",
          "headers",
          "links",
          "callbacks",
          "mediaTypes",
        ],
      },
      preserveEmptyObjects: false,
    });

    if (!existsSync(outputDirPath)) {
      mkdirSync(outputDirPath, { recursive: true });
    }

    writeFileSync(finalPath, JSON.stringify(filtered.data, null, 2), "utf-8");

    console.log(`\n🎉 ГОТОВО!`);
    console.log(`Файл: ${finalPath}`);
  } catch (err: any) {
    console.error("❌ Ошибка:", err.message || err);
    process.exit(1);
  }
}

main();
