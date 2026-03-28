import template from "@/ai/prompts/templates/group-channels-by-creator.md";
import type {
  ChannelForGrouping,
  GroupChannelsByCreatorPromptProps,
} from "@/ai/prompts/types/group-channels-by-creator";
import { interpolate } from "@/ai/utils/interpolate-template";

export function groupChannelsByCreatorPrompt({
  channels,
}: GroupChannelsByCreatorPromptProps): string {
  return interpolate(template, {
    CHANNEL_COUNT: String(channels.length),
    CHANNELS: buildChannelsBlock(channels),
  });
}

function buildChannelEntry(ch: ChannelForGrouping, index: number): string {
  const lines: string[] = [
    `Channel ${index} (${ch.platformSlug}): "${ch.name}"`,
  ];

  if (ch.description) {
    lines.push(`  Description: ${ch.description.slice(0, 300)}`);
  }

  if (ch.recentVideoTitles.length > 0) {
    const titles = ch.recentVideoTitles
      .slice(0, 3)
      .map((t) => `"${t}"`)
      .join(", ");

    lines.push(`  Recent videos: ${titles}`);
  }

  return lines.join("\n");
}

function buildChannelsBlock(channels: ChannelForGrouping[]): string {
  return channels.map(buildChannelEntry).join("\n\n");
}
