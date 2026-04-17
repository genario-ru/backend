import template from "@/ai/prompts/templates/generate-scenario-chapters.md";
import type { GenerateScenarioChaptersPromptProps } from "@/ai/prompts/types/generate-scenario-chapters";
import { buildContextLines } from "@/ai/utils/build-context-lines";
import { interpolate } from "@/ai/utils/interpolate-template";

export function generateScenarioChaptersPrompt({
  context,
}: GenerateScenarioChaptersPromptProps) {
  const {
    scenarioName,
    scenarioDescription,
    scenarioTargetAudience,
    scenarioTemplateName,
    scenarioTemplateDescription,
    scenarioProfileName,
    scenarioProfileDescription,
    scenarioPlatformNames,
    scenarioVideoTypeName,
    scenarioVideoDurationName,
    scenarioMinimumDurationSeconds,
    scenarioMaximumDurationSeconds,
    scenarioTones,
  } = context;

  const minDuration = scenarioMinimumDurationSeconds ?? 0;
  const isOpenEnded = scenarioMaximumDurationSeconds == null;
  const maxDuration = scenarioMaximumDurationSeconds ?? minDuration;
  const chapterCount = estimateChapterCount(maxDuration, isOpenEnded);

  const contextLines = buildContextLines([
    ["Scenario name", scenarioName],
    ["Scenario description", scenarioDescription],
    ["Target audience", scenarioTargetAudience],
    ["Template name", scenarioTemplateName],
    ["Template description", scenarioTemplateDescription],
    ["Profile name", scenarioProfileName],
    ["Profile description", scenarioProfileDescription],
    ["Video type", scenarioVideoTypeName],
    ["Video duration", scenarioVideoDurationName],
    ["Platforms", scenarioPlatformNames?.join(", ")],
    ["Tones", scenarioTones?.join(", ")],
  ]);

  return interpolate(template, {
    TIMELINE_INSTRUCTION: buildTimelineInstruction(
      isOpenEnded,
      chapterCount,
      maxDuration,
      minDuration,
    ),
    END_TIME_RULE: buildEndTimeRule(isOpenEnded, maxDuration, minDuration),
    CONTEXT: contextLines,
  });
}

function estimateChapterCount(
  durationSeconds: number,
  isOpenEnded: boolean,
): string {
  if (isOpenEnded) return "8–10";
  if (durationSeconds <= 30) return "2–3";
  if (durationSeconds <= 60) return "3–4";
  if (durationSeconds <= 120) return "3–5";
  if (durationSeconds <= 300) return "4–6";
  if (durationSeconds <= 600) return "5–8";
  if (durationSeconds <= 1800) return "6–10";
  return "8–10";
}

function buildTimelineInstruction(
  isOpenEnded: boolean,
  chapterCount: string,
  maxDuration: number,
  minDuration: number,
): string {
  if (isOpenEnded) {
    return `Divide the video scenario into ${chapterCount} chapters starting from 0 seconds. The video has no fixed end time — choose a total duration that fits the content naturally (at least ${minDuration}s).`;
  }

  return `Divide the video scenario into ${chapterCount} chapters covering exactly 0 to ${maxDuration} seconds.`;
}

function buildEndTimeRule(
  isOpenEnded: boolean,
  maxDuration: number,
  minDuration: number,
): string {
  if (isOpenEnded) {
    return `First chapter starts at 0. Last chapter ends at the total duration you choose (at least ${minDuration}s).`;
  }

  return `First chapter starts at 0. Last chapter ends at exactly ${maxDuration}.`;
}
