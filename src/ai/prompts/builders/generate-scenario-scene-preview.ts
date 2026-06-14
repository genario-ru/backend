import template from "@/ai/prompts/templates/generate-scenario-scene-preview.md";
import type {
  GenerateScenarioScenePreviewPromptProps,
  ScenePreviewComponent,
} from "@/ai/prompts/types/generate-scenario-scene-preview";
import { buildContextLines } from "@/ai/utils/build-context-lines";
import { interpolate } from "@/ai/utils/interpolate-template";

// Slugs of scene components that carry visual meaning for a still image.
// Audio, transitions, and subtitles are intentionally excluded: they describe
// sound or on-screen text, which a single thumbnail must not depict or render.
const VISUAL_SLUG = "visual";
const VOICEOVER_SLUG = "voiceover";
const EMOTIONS_SLUG = "emotions";
const LIGHTING_SLUG = "lighting";
const GESTURES_SLUG = "gestures";
const CAMERA_SLUG = "camera";
const NOTES_SLUG = "notes";

export function generateScenarioScenePreviewPrompt(
  props: GenerateScenarioScenePreviewPromptProps,
): string {
  return interpolate(template, {
    ASPECT_GUIDANCE: buildAspectGuidance(props.videoTypeSlug),
    SCENE_DESCRIPTION: buildSceneDescription(props),
    BACKGROUND_CONTEXT: buildBackgroundContext(props),
  });
}

function buildAspectGuidance(videoTypeSlug: string | null): string {
  switch (videoTypeSlug) {
    case "short":
      return "Vertical 9:16 portrait composition; keep the focal subject centered and readable as a tall thumbnail.";
    case "long":
      return "Horizontal 16:9 landscape composition; cinematic wide framing.";
    default:
      return "Square 1:1 composition with a centered focal subject.";
  }
}

function buildSceneDescription(
  props: GenerateScenarioScenePreviewPromptProps,
): string {
  const contentBySlug = mapComponentContent(props.sceneComponents);

  const visual = contentBySlug.get(VISUAL_SLUG);
  const voiceover = contentBySlug.get(VOICEOVER_SLUG);

  const inFrame = visual ?? deriveInFrameFallback(props.sceneName, voiceover);
  const mood = props.toneNames.length > 0 ? props.toneNames.join(", ") : null;

  const lines = buildContextLines([
    ["Scene title", props.sceneName],
    [
      "What is in frame (MOST IMPORTANT — base the image on this)",
      truncate(inFrame, 700),
    ],
    [
      "What the narration is about (convey the idea visually, never as text)",
      truncate(voiceover, 500),
    ],
    ["Emotion to convey", truncate(contentBySlug.get(EMOTIONS_SLUG), 200)],
    ["Lighting", truncate(contentBySlug.get(LIGHTING_SLUG), 200)],
    [
      "Subject pose and gestures",
      truncate(contentBySlug.get(GESTURES_SLUG), 200),
    ],
    [
      "Camera framing / shot type",
      truncate(contentBySlug.get(CAMERA_SLUG), 200),
    ],
    ["Overall mood / tone", mood],
    ["Additional art direction", truncate(contentBySlug.get(NOTES_SLUG), 200)],
  ]);

  return lines.trim() === ""
    ? "- A neutral, on-topic establishing shot."
    : lines;
}

function buildBackgroundContext(
  props: GenerateScenarioScenePreviewPromptProps,
): string {
  let video = props.scenarioName;

  if (video && props.scenarioDescription) {
    video = `${video} — ${truncate(props.scenarioDescription, 300)}`;
  }

  const lines = buildContextLines([
    ["Chapter", props.chapterName],
    ["Chapter summary", truncate(props.chapterDescription, 300)],
    ["Video", video],
    ["Target audience", props.scenarioTargetAudience],
  ]);

  return lines.trim() === "" ? "- none" : lines;
}

function mapComponentContent(
  components: ScenePreviewComponent[],
): Map<string, string> {
  const result = new Map<string, string>();

  for (const component of components) {
    const content = component.content?.trim();

    // Keep the first non-empty content per slug; ignore blanks and duplicates.
    if (content && !result.has(component.slug)) {
      result.set(component.slug, content);
    }
  }

  return result;
}

function deriveInFrameFallback(
  sceneName: string | null,
  voiceover: string | undefined,
): string {
  if (voiceover) {
    return `A scene that visually represents the idea: ${truncate(voiceover, 400)}`;
  }

  if (sceneName) {
    return `A scene that visually represents: ${sceneName}`;
  }

  return "A neutral, on-topic establishing shot";
}

function truncate(
  value: string | null | undefined,
  maxLength: number,
): string | null {
  if (value === null || value === undefined) return null;

  const trimmed = value.trim();

  if (trimmed === "") return null;
  if (trimmed.length <= maxLength) return trimmed;

  const slice = trimmed.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > maxLength * 0.6 ? slice.slice(0, lastSpace) : slice;

  return `${cut.trimEnd()}…`;
}
