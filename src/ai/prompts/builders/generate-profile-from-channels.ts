import template from "@/ai/prompts/templates/generate-profile-from-channels.md";
import type {
  ChannelDataInput,
  GenerateProfileFromChannelsPromptProps,
  ToneInput,
} from "@/ai/prompts/types/generate-profile-from-channels";
import { interpolate } from "@/ai/utils/interpolate-template";

export function generateProfileFromChannelsPrompt({
  channels,
  availableTones,
}: GenerateProfileFromChannelsPromptProps): string {
  return interpolate(template, {
    CHANNELS: buildChannelsBlock(channels),
    TONES: buildTonesBlock(availableTones),
  });
}

function buildChannelsBlock(channels: ChannelDataInput[]): string {
  return channels
    .map((channel, index) => {
      const lines: string[] = [
        `## Channel ${index + 1} (${channel.platformSlug})`,
        `- Name: ${channel.name}`,
      ];

      if (channel.description) {
        lines.push(`- Description: ${channel.description}`);
      }

      if (channel.subscribersCount != null) {
        lines.push(`- Subscribers: ${channel.subscribersCount}`);
      }

      if (channel.videoCount != null) {
        lines.push(`- Total videos: ${channel.videoCount}`);
      }

      if (channel.recentVideos.length > 0) {
        lines.push("- Recent videos:");
        channel.recentVideos.forEach((video, i) => {
          const desc = video.description
            ? ` — ${video.description.slice(0, 200)}`
            : "";

          lines.push(`  ${i + 1}. "${video.title}"${desc}`);
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
