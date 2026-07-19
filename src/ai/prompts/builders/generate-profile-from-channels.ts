import template from "@/ai/prompts/templates/generate-profile-from-channels.md";
import type {
  ChannelDataInput,
  GenerateProfileFromChannelsPromptProps,
  ToneInput,
} from "@/ai/prompts/types/generate-profile-from-channels";
import { interpolate } from "@/ai/utils/interpolate-template";
import { truncateForPrompt } from "@/ai/utils/truncate-for-prompt";

const PROMPT_VIDEO_DESCRIPTION_MAX_LENGTH = 200;
const PROMPT_VIDEO_SUMMARY_MAX_LENGTH = 400;
const PROMPT_VIDEO_TRANSCRIPT_MAX_LENGTH = 500;

export function generateProfileFromChannelsPrompt({
  channels,
  availableTones,
}: GenerateProfileFromChannelsPromptProps): string {
  return interpolate(template, {
    CHANNELS: buildChannelsBlock(channels),
    TONES: buildTonesBlock(availableTones),
  });
}

function buildVideoEntry(
  video: ChannelDataInput["recentVideos"][number],
): string {
  const lines = [`- "${video.title}"`];

  if (video.description) {
    lines.push(
      `- Description: ${truncateForPrompt({
        text: video.description,
        maxLength: PROMPT_VIDEO_DESCRIPTION_MAX_LENGTH,
      })}`,
    );
  }

  if (video.summary) {
    lines.push(
      `- Summary: ${truncateForPrompt({
        text: video.summary,
        maxLength: PROMPT_VIDEO_SUMMARY_MAX_LENGTH,
      })}`,
    );
  }

  if (video.mainTopics && video.mainTopics.length > 0) {
    lines.push(`- Main topics: ${video.mainTopics.join(", ")}`);
  }

  if (video.keyPoints && video.keyPoints.length > 0) {
    lines.push(`- Key points: ${video.keyPoints.join("; ")}`);
  }

  if (video.tone) {
    lines.push(`- Tone: ${video.tone}`);
  }

  if (video.transcript) {
    lines.push(
      `- Transcript excerpt: ${truncateForPrompt({
        text: video.transcript,
        maxLength: PROMPT_VIDEO_TRANSCRIPT_MAX_LENGTH,
      })}`,
    );
  }

  return lines.join("\n");
}

function buildChannelsBlock(channels: ChannelDataInput[]): string {
  return channels
    .map((channel, index) => {
      const lines: string[] = [
        `## Channel ${index + 1} (${channel.platformSlug})`,
        `- Name: ${channel.name}`,
      ];

      if (channel.slug) {
        lines.push(`- Username: @${channel.slug.replace(/^@/, "")}`);
      }

      if (channel.description) {
        lines.push(`- Description: ${channel.description}`);
      }

      if (channel.verified != null) {
        lines.push(`- Verified: ${channel.verified ? "yes" : "no"}`);
      }

      if (channel.followers != null) {
        lines.push(`- Followers: ${channel.followers}`);
      }

      if (channel.subscribersCount != null) {
        lines.push(`- Subscribers: ${channel.subscribersCount}`);
      }

      if (channel.videoCount != null) {
        lines.push(`- Total videos: ${channel.videoCount}`);
      }

      if (channel.recentVideos.length > 0) {
        lines.push("- Recent videos:");
        channel.recentVideos.forEach((video) => {
          lines.push(buildVideoEntry(video));
        });
      }

      return lines.join("\n");
    })
    .join("\n\n");
}

function buildTonesBlock(tones: ToneInput[]): string {
  if (tones.length === 0) return "No tones available.";

  return tones
    .map((tone) => {
      const desc = tone.description ? ` — ${tone.description}` : "";

      return `- ID: ${tone.id} | Name: ${tone.name}${desc}`;
    })
    .join("\n");
}
