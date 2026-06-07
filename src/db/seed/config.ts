import type { PgTable } from "drizzle-orm/pg-core";

import {
  creditsPackage,
  exportDocumentFormat,
  legalDocument,
  platform,
  productionStatus,
  profileType,
  scenarioSceneComponentType,
  tariff,
  template,
  tone,
  videoDuration,
  videoType,
} from "@/db/schema";

import creditsPackageData from "../../../data/credits_package.json";
import exportDocumentFormatData from "../../../data/export_document_format.json";
import legalDocumentData from "../../../data/legal_document.json";
import platformData from "../../../data/platform.json";
import productionStatusData from "../../../data/production_status.json";
import profileTypeData from "../../../data/profile_type.json";
import scenarioSceneComponentTypeData from "../../../data/scenario_scene_component_type.json";
import tariffData from "../../../data/tariff.json";
import templateData from "../../../data/template.json";
import toneData from "../../../data/tone.json";
import videoDurationData from "../../../data/video_duration.json";
import videoTypeData from "../../../data/video_type.json";

export type SeedEntry = {
  /** Имя таблицы — только для логов. */
  name: string;
  table: PgTable;
  /** Сырые строки из JSON (ключи в snake_case). */
  rows: Record<string, unknown>[];
};

/**
 * Порядок важен: таблицы, на которые ссылаются по внешнему ключу, идут раньше
 * зависимых. На текущий момент единственная FK-связь среди дефолтных данных:
 * `tariff.credits_package_id -> credits_package.id`, поэтому `credits_package`
 * сидится первым. Остальные таблицы независимы.
 */
export const seedEntries: SeedEntry[] = [
  { name: "credits_package", table: creditsPackage, rows: creditsPackageData },
  { name: "tariff", table: tariff, rows: tariffData },
  { name: "template", table: template, rows: templateData },
  { name: "tone", table: tone, rows: toneData },
  { name: "platform", table: platform, rows: platformData },
  { name: "video_duration", table: videoDuration, rows: videoDurationData },
  { name: "video_type", table: videoType, rows: videoTypeData },
  { name: "profile_type", table: profileType, rows: profileTypeData },
  {
    name: "production_status",
    table: productionStatus,
    rows: productionStatusData,
  },
  {
    name: "export_document_format",
    table: exportDocumentFormat,
    rows: exportDocumentFormatData,
  },
  {
    name: "scenario_scene_component_type",
    table: scenarioSceneComponentType,
    rows: scenarioSceneComponentTypeData,
  },
  { name: "legal_document", table: legalDocument, rows: legalDocumentData },
];
