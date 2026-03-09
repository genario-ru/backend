#!/usr/bin/env tsx
/* eslint-disable security/detect-non-literal-fs-filename */

import { existsSync, mkdirSync, writeFileSync } from "fs";
import { openapiFilter } from "openapi-format";
import { join } from "path";
import YAML from "yaml";

import { envs } from "@/constants/common/envs";

// ====================== НАСТРОЙКИ ======================

const OUTPUT_DIR = "deps/api";
const FINAL_FILENAME = "yookassa.json";
const TARGET_TAGS = ["Payments"];
const DOWNLOAD_URL = envs.YOOKASSA_OPENAPI_URL;

// ====================== ОСНОВНАЯ ЛОГИКА ======================

async function main() {
  const outputDirPath = join(process.cwd(), OUTPUT_DIR);
  const finalPath = join(outputDirPath, FINAL_FILENAME);

  try {
    console.log(`📥 Скачиваю OpenAPI ЮKassa...`);

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

    let cleanSpec = filtered.data;

    console.log(`🔧 Исправляем проблемные регулярки...`);
    cleanSpec = fixAllPatterns(cleanSpec);

    console.log(`🔧 Исправляем enum с числами внутри type: string...`);
    cleanSpec = fixInvalidStringEnums(cleanSpec);

    // Сохраняем
    if (!existsSync(outputDirPath))
      mkdirSync(outputDirPath, { recursive: true });
    writeFileSync(finalPath, JSON.stringify(cleanSpec, null, 2), "utf-8");

    console.log(`\n🎉 ГОТОВО!`);
    console.log(`Файл: ${finalPath}`);
    console.log(`   (все regex + numeric enum в string полях исправлены)`);
  } catch (err: any) {
    console.error("❌ Ошибка:", err.message || err);
    process.exit(1);
  }
}

// ====================== ФИКСЫ ======================

function sanitizePattern(pattern: string): string {
  return pattern
    .replace(/\(\?s\)/g, "[\\s\\S]") // dotAll
    .replace(/[—–‐‑]/g, "-") // разные тире
    .replace(/^\^|\$$/g, ""); // лишние якоря
}

function fixInvalidStringEnums(obj: any): any {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(fixInvalidStringEnums);

  const result: any = { ...obj };

  // === Главный фикс: type: string + enum с числами ===
  if (result.type === "string" && Array.isArray(result.enum)) {
    const hasNumbers = result.enum.some((v: any) => typeof v === "number");
    if (hasNumbers) {
      result.enum = result.enum.map((v: any) =>
        typeof v === "number" ? String(v) : v,
      );
      console.log(`🔧 Исправлен enum (числа → строки) в поле типа string`);
    }
  }

  // Также фиксим example, если он число
  if (result.type === "string" && typeof result.example === "number") {
    result.example = String(result.example);
  }

  // Рекурсия по всем вложенным объектам
  for (const [key, value] of Object.entries(result)) {
    result[key] = fixInvalidStringEnums(value);
  }

  return result;
}

function fixAllPatterns(obj: any): any {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(fixAllPatterns);

  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === "pattern" && typeof value === "string") {
      result[key] = sanitizePattern(value);
    } else {
      result[key] = fixAllPatterns(value);
    }
  }
  return result;
}

main();
