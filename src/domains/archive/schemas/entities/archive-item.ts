import { ideasListExtendedSchema } from "@/domains/ideas-lists/schemas/entities/ideas-list";
import { scenarioExtendedSchema } from "@/domains/scenarios/schemas/entities/scenario";
import { z } from "@/lib/zod";

export const archiveEntitySchema = z.enum(["ideasList", "scenario"]).meta({
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
  .meta({
    title: "Archive ideas list",
    description: "Archive ideas list description",
    ref: "ArchiveIdeasListSchema",
  });

export type ArchiveIdeasList = z.infer<typeof archiveIdeasListSchema>;

export const archiveScenarioSchema = z
  .object({
    entity: z.literal(archiveEntitySchema.enum.scenario),
    data: scenarioExtendedSchema,
  })
  .meta({
    title: "Archive scenario",
    description: "Archive scenario description",
    ref: "ArchiveScenarioSchema",
  });

export type ArchiveScenario = z.infer<typeof archiveScenarioSchema>;

export const archiveItemSchema = z
  .discriminatedUnion("entity", [archiveIdeasListSchema, archiveScenarioSchema])
  .meta({
    title: "Archive item",
    description: "Archive item description",
    ref: "ArchiveItemSchema",
  });

export type ArchiveItem = z.infer<typeof archiveItemSchema>;

export type ArchiveItemWithFilters = {
  entity: ArchiveEntity;
  data: {
    tones?: Array<{ id: string }>;
    videoTypes?: Array<{ id: string }>;
    videoType?: { id: string } | null;
    platforms?: Array<{ id: string }> | null;
    videoDuration?: { id: string } | null;
    createdAt: string | Date;
    updatedAt: string | Date;
    [key: string]: unknown;
  };
};
