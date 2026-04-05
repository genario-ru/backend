import type { ScenarioExtended } from "@/schemas/domains/scenarios/entities/scenario";
import type { ScenarioChapter } from "@/schemas/domains/scenarios/entities/scenario-chapter";
import type { ScenarioScene } from "@/schemas/domains/scenarios/entities/scenario-scene";
import type { ScenarioSceneComponentExtended } from "@/schemas/domains/scenarios/entities/scenario-scene-component";
import type { ScenarioVersion } from "@/schemas/domains/scenarios/entities/scenario-version";

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
