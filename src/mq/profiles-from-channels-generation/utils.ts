import { zodTextFormat } from "openai/helpers/zod";

import { groupChannelsByCreatorPrompt } from "@/ai/prompts/builders/group-channels-by-creator";
import { analyticalSystemPrompt } from "@/ai/prompts/builders/system-prompt";
import { polzaAI } from "@/ai/providers/open-ai/polza-ai";
import { channelGroupsGeneratedSchema } from "@/domains/profiles/schemas/entities/channel-groups-generated";
import { env } from "@/env";
import {
  isSocialKitVideoPlatformSlug,
  type SocialKitVideoPlatformSlug,
} from "@/lib/socialkit/types/video-platform-slug";
import type { ProfileChannelStatsData } from "@/lib/socialkit/utils/fetch-profile-channel-stats";
import {
  fetchProfileChannelVideoSummarize,
  fetchProfileChannelVideoTranscript,
} from "@/lib/socialkit/utils/fetch-profile-channel-video-enrichment";
import { fetchProfileChannelVideos } from "@/lib/socialkit/utils/fetch-profile-channel-videos";

import type { ChannelInput } from "./queue";
import type { FetchedChannel, FetchedChannelVideo } from "./types";

const RECENT_VIDEOS_LIMIT = 3;

export async function fetchChannelData(
  channelInput: ChannelInput,
): Promise<FetchedChannel | null> {
  const { url, platformSlug, stats } = channelInput;

  if (!isSocialKitVideoPlatformSlug(platformSlug)) {
    return null;
  }

  const videos = await fetchProfileChannelVideos({
    url,
    platformSlug,
    limit: RECENT_VIDEOS_LIMIT,
  });

  const enrichedVideos = await enrichChannelVideos({
    videos: videos.map((video) => ({ ...video, enrichment: null })),
    platformSlug,
  });

  return {
    input: channelInput,
    data: buildChannelDataInput({
      platformSlug,
      stats,
      videos: enrichedVideos,
    }),
    externalId: stats.externalId ?? stats.slug ?? url,
    slug: stats.slug,
    avatarUrl: stats.avatarUrl,
    name: stats.name,
    description: stats.description,
    verified: stats.verified,
    followers: stats.followers,
    following: stats.following,
    totalPosts: stats.totalPosts,
    videos: enrichedVideos,
  };
}

type EnrichChannelVideosParams = {
  videos: FetchedChannelVideo[];
  platformSlug: SocialKitVideoPlatformSlug;
};

export async function enrichChannelVideos({
  videos,
  platformSlug,
}: EnrichChannelVideosParams): Promise<FetchedChannelVideo[]> {
  const enrichmentResults = await Promise.allSettled(
    videos.map(async (video) => {
      if (!video.url) {
        return {
          ...video,
          enrichment: null,
        };
      }

      const [summarizeData, transcriptData] = await Promise.all([
        fetchProfileChannelVideoSummarize({
          url: video.url,
          platformSlug,
        }),
        fetchProfileChannelVideoTranscript({
          url: video.url,
          platformSlug,
        }),
      ]);

      return {
        ...video,
        enrichment: {
          ...summarizeData,
          ...transcriptData,
        },
      };
    }),
  );

  return enrichmentResults.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    }

    console.error("Failed to enrich channel video", {
      url: videos[index]?.url,
      platformSlug,
      error: result.reason,
    });

    return {
      ...videos[index],
      enrichment: null,
    };
  });
}

type BuildChannelDataInputParams = {
  platformSlug: string;
  stats: ProfileChannelStatsData;
  videos: FetchedChannelVideo[];
};

function buildChannelDataInput({
  platformSlug,
  stats,
  videos,
}: BuildChannelDataInputParams) {
  return {
    platformSlug,
    name: stats.name,
    description: stats.description,
    slug: stats.slug,
    verified: stats.verified,
    followers: stats.followers,
    subscribersCount: stats.followers,
    videoCount: stats.totalPosts,
    recentVideos: videos.map((video) => ({
      title: video.name ?? "",
      description: video.description,
      summary: video.enrichment?.summary ?? null,
      mainTopics: video.enrichment?.mainTopics ?? undefined,
      keyPoints: video.enrichment?.keyPoints ?? undefined,
      tone: video.enrichment?.tone ?? null,
      transcript: video.enrichment?.transcript ?? null,
    })),
  };
}

export async function groupChannelsByCreator(
  fetchedChannels: FetchedChannel[],
): Promise<number[][]> {
  if (fetchedChannels.length === 1) {
    return [[0]];
  }

  const fallbackGroups = fetchedChannels.map((_, index) => [index]);

  const prompt = groupChannelsByCreatorPrompt({
    channels: fetchedChannels.map((channel) => ({
      platformSlug: channel.data.platformSlug,
      name: channel.data.name,
      slug: channel.data.slug,
      description: channel.data.description,
      verified: channel.verified,
      followers: channel.followers,
      recentVideoTitles: channel.data.recentVideos.map((video) => video.title),
      recentVideos: channel.data.recentVideos.map((video) => ({
        title: video.title,
        summary: video.summary,
        mainTopics: video.mainTopics,
        tone: video.tone,
      })),
    })),
  });

  const parseResult = await polzaAI.responses
    .parse({
      model: env.POLZA_AI_STRUCTURED_OUTPUT_MODEL,
      temperature: 0.1,
      input: [
        { role: "system", content: analyticalSystemPrompt() },
        { role: "user", content: prompt },
      ],
      text: {
        format: zodTextFormat(channelGroupsGeneratedSchema, "channelGroups"),
      },
    })
    .catch((error) => {
      console.error("Failed to group channels by creator", error);
      return null;
    });

  const outputParsed = parseResult?.output_parsed;

  if (!outputParsed) {
    return fallbackGroups;
  }

  const allIndicesSet = new Set(fetchedChannels.map((_, index) => index));
  const coveredIndicesSet = new Set(outputParsed.groups.flat());

  const isValid =
    coveredIndicesSet.size === allIndicesSet.size &&
    Array.from(coveredIndicesSet).every((index) => allIndicesSet.has(index));

  if (isValid) {
    return outputParsed.groups;
  }

  return fallbackGroups;
}
