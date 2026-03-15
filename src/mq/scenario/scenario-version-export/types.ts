import type { ScenarioExtended } from "@/schemas/entities/scenarios/entities/scenario";
import type { ScenarioChapter } from "@/schemas/entities/scenarios/entities/scenario-chapter";
import type { ScenarioScene } from "@/schemas/entities/scenarios/entities/scenario-scene";
import type { ScenarioSceneComponentExtended } from "@/schemas/entities/scenarios/entities/scenario-scene-component";
import type { ScenarioVersion } from "@/schemas/entities/scenarios/entities/scenario-version";

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
