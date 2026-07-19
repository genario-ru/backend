import template from "@/ai/prompts/templates/group-channels-by-creator.md";
import type {
  ChannelForGrouping,
  ChannelVideoForGrouping,
  GroupChannelsByCreatorPromptProps,
} from "@/ai/prompts/types/group-channels-by-creator";
import { interpolate } from "@/ai/utils/interpolate-template";
import { truncateForPrompt } from "@/ai/utils/truncate-for-prompt";

const PROMPT_CHANNEL_DESCRIPTION_MAX_LENGTH = 300;
const PROMPT_VIDEO_SUMMARY_MAX_LENGTH = 200;

export function groupChannelsByCreatorPrompt({
  channels,
}: GroupChannelsByCreatorPromptProps): string {
  return interpolate(template, {
    CHANNEL_COUNT: String(channels.length),
    CHANNELS: buildChannelsBlock(channels),
  });
}

function buildVideoEntry(video: ChannelVideoForGrouping): string {
  const lines = [`- "${video.title}"`];

  if (video.summary) {
    lines.push(
      `- Summary: ${truncateForPrompt({
        text: video.summary,
        maxLength: PROMPT_VIDEO_SUMMARY_MAX_LENGTH,
      })}`,
    );
  }

  if (video.mainTopics && video.mainTopics.length > 0) {
    lines.push(`- Topics: ${video.mainTopics.join(", ")}`);
  }

  if (video.tone) {
    lines.push(`- Tone: ${video.tone}`);
  }

  return lines.join("\n");
}

function buildChannelEntry(ch: ChannelForGrouping, index: number): string {
  const lines: string[] = [
    `Channel ${index} (${ch.platformSlug}): "${ch.name}"`,
  ];

  if (ch.slug) {
    lines.push(`- Username: @${ch.slug.replace(/^@/, "")}`);
  }

  if (ch.description) {
    lines.push(
      `- Description: ${truncateForPrompt({
        text: ch.description,
        maxLength: PROMPT_CHANNEL_DESCRIPTION_MAX_LENGTH,
      })}`,
    );
  }

  if (ch.verified != null) {
    lines.push(`- Verified: ${ch.verified ? "yes" : "no"}`);
  }

  if (ch.followers != null) {
    lines.push(`- Followers: ${ch.followers}`);
  }

  if (ch.recentVideos && ch.recentVideos.length > 0) {
    lines.push("- Recent videos:");
    ch.recentVideos.forEach((video) => {
      lines.push(buildVideoEntry(video));
    });
  } else if (ch.recentVideoTitles.length > 0) {
    const titles = ch.recentVideoTitles.map((title) => `"${title}"`).join(", ");

    lines.push(`- Recent videos: ${titles}`);
  }

  return lines.join("\n");
}

function buildChannelsBlock(channels: ChannelForGrouping[]): string {
  return channels.map(buildChannelEntry).join("\n\n");
}
