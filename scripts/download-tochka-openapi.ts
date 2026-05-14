#!/usr/bin/env tsx
/* eslint-disable security/detect-non-literal-fs-filename */

import { existsSync, mkdirSync, writeFileSync } from "fs";
import { openapiFilter } from "openapi-format";
import { join } from "path";

import { env } from "@/env";

// ====================== НАСТРОЙКИ ======================

const OUTPUT_DIR = "deps/api";
const FINAL_FILENAME = "tochka.json";
const TARGET_TAGS = ["Работа с платёжными ссылками"];
const DOWNLOAD_URL = env.TOCHKA_OPENAPI_URL;

// ====================== ОСНОВНАЯ ЛОГИКА ======================

async function main() {
  const outputDirPath = join(process.cwd(), OUTPUT_DIR);
  const finalPath = join(outputDirPath, FINAL_FILENAME);

  try {
    console.log(`📥 Загружаю схему:\n   ${DOWNLOAD_URL}`);

    const res = await fetch(DOWNLOAD_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const spec = await res.json();

    console.log(`🧹 Фильтрую по тегам "${TARGET_TAGS}" + очищаю компоненты...`);

    const filterResult = await openapiFilter(spec, {
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

    let cleanSpec = filterResult.data;

    // ← Самый важный фикс
    console.log(`🔧 Нормализуем русские имена security-схем...`);
    cleanSpec = normalizeSecuritySchemes(cleanSpec);

    // Сохраняем финальный чистый файл
    if (!existsSync(outputDirPath)) {
      mkdirSync(outputDirPath, { recursive: true });
    }

    writeFileSync(finalPath, JSON.stringify(cleanSpec, null, 2), "utf-8");

    console.log(`\n🎉 ГОТОВО!`);
    console.log(`Чистая схема сохранена: ${finalPath}`);
    console.log(`(русские security-схемы исправлены → валидация Kubb пройдёт)`);
  } catch (err: any) {
    console.error("❌ Ошибка:", err.message || err);
    process.exit(1);
  }
}

// ====================== ФИКСЫ ======================

// Фикс русских имён security-схем (самая частая проблема Tochka)
function normalizeSecuritySchemes(spec: any) {
  if (!spec.components?.securitySchemes) return spec;

  const replacements: Record<string, string> = {
    "Необходимые разрешения": "RequiredPermissions",
    // Добавляй сюда другие русские имена, если появятся:
    // 'Другое русское имя': 'AnotherName',
  };

  for (const [oldName, newName] of Object.entries(replacements)) {
    if (spec.components.securitySchemes[oldName]) {
      console.log(
        `🔧 Переименовываю security scheme: "${oldName}" → "${newName}"`,
      );

      // 1. Переименовываем определение
      spec.components.securitySchemes[newName] =
        spec.components.securitySchemes[oldName];
      delete spec.components.securitySchemes[oldName];

      // 2. Обновляем ВСЕ ссылки в операциях
      for (const pathItem of Object.values(spec.paths || {})) {
        for (const operation of Object.values(
          pathItem as Record<string, any>,
        )) {
          if (Array.isArray(operation.security)) {
            operation.security = operation.security.map((sec: any) => {
              if (sec[oldName] !== undefined) {
                const newSec: any = {};
                newSec[newName] = sec[oldName];
                return newSec;
              }
              return sec;
            });
          }
        }
      }
    }
  }
  return spec;
}

main();
