import type { ScenarioExtended } from "@/domains/scenarios/schemas/entities/scenario";
import type { ScenarioChapter } from "@/domains/scenarios/schemas/entities/scenario-chapter";
import type { ScenarioScene } from "@/domains/scenarios/schemas/entities/scenario-scene";
import type { ScenarioSceneComponentExtended } from "@/domains/scenarios/schemas/entities/scenario-scene-component";
import type { ScenarioVersion } from "@/domains/scenarios/schemas/entities/scenario-version";

type ScenarioSceneExport = ScenarioScene & {
  components: ScenarioSceneComponentExtended[];
};

type ScenarioChapterExport = ScenarioChapter & {
  scenes: ScenarioSceneExport[];
};

export type ScenarioVersionExportData = ScenarioVersion & {
  scenario: ScenarioExtended;
  chapters: ScenarioChapterExport[];
};
