import { z } from "@/lib/zod";

import { ideasListExtendedSchema } from "../../ideas-lists/entities/ideas-list";
import { scenarioExtendedSchema } from "../../scenarios/entities/scenario";
import { archiveRegistry } from "../registry";

export const archiveEntitySchema = z
  .enum(["ideasList", "scenario"])
  .register(archiveRegistry, {
    title: "Archive entity",
    description: "Archive entity discriminator",
    ref: "ArchiveEntitySchema",
  });

export type ArchiveEntity = z.infer<typeof archiveEntitySchema>;

export const archiveIdeasListSchema = z
  .object({
    entity: z.literal(archiveEntitySchema.enum.ideasList),
    data: ideasListExtendedSchema,
  })
  .register(archiveRegistry, {
    title: "Archive ideas list",
    description: "Ideas list in archive",
    ref: "ArchiveIdeasListSchema",
  });

export type ArchiveIdeasList = z.infer<typeof archiveIdeasListSchema>;

export const archiveScenarioSchema = z
  .object({
    entity: z.literal(archiveEntitySchema.enum.scenario),
    data: scenarioExtendedSchema,
  })
  .register(archiveRegistry, {
    title: "Archive scenario",
    description: "Scenario in archive",
    ref: "ArchiveScenarioSchema",
  });

export type ArchiveScenario = z.infer<typeof archiveScenarioSchema>;

export const archiveItemSchema = z
  .discriminatedUnion("entity", [archiveIdeasListSchema, archiveScenarioSchema])
  .register(archiveRegistry, {
    title: "Archive item",
    description: "Archive item with discriminator",
    ref: "ArchiveItemSchema",
  });

export type ArchiveItem = z.infer<typeof archiveItemSchema>;

export type ArchiveItemWithFilters = {
  entity: ArchiveEntity;
  data: {
    tones?: Array<{ id: string }>;
    videoTypes?: Array<{ id: string }>;
    videoType?: { id: string } | null;
    platform?: { id: string } | null;
    videoDuration?: { id: string } | null;
    createdAt: string | Date;
    updatedAt: string | Date;
    [key: string]: unknown;
  };
};
