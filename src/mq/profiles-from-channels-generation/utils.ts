import { zodTextFormat } from "openai/helpers/zod";

import { groupChannelsByCreatorPrompt } from "@/ai/prompts/builders/group-channels-by-creator";
import { systemPrompt } from "@/ai/prompts/builders/system-prompt";
import { polzaAI } from "@/ai/providers/open-ai/polza-ai";
import {
  getUserProfile as getRuTubeUserProfile,
  getVideosByAuthorId as getRuTubeVideosByAuthorId,
} from "@/codegen/api/rutube/clients";
import { channelGroupsGeneratedSchema } from "@/domains/profiles/schemas/entities/channel-groups-generated";
import { extractRuTubeChannelIdentifier } from "@/lib/rutube";
import {
  extractYouTubeChannelIdentifier,
  getYouTubeChannel,
  getYouTubeChannelVideos,
} from "@/lib/youtube";
import { envs } from "@/shared/constants/common/envs";

import type { ChannelInput } from "./queue";
import type { FetchedChannel } from "./types";

const RECENT_VIDEOS_LIMIT = 5;

export async function fetchChannelData(
  channelInput: ChannelInput,
): Promise<FetchedChannel | null> {
  const { url, platformSlug } = channelInput;

  if (platformSlug === "youtube") {
    return fetchYouTubeChannelData(channelInput, url);
  }

  if (platformSlug === "rutube") {
    return fetchRuTubeChannelData(channelInput, url);
  }

  return null;
}

async function fetchYouTubeChannelData(
  channelInput: ChannelInput,
  url: string,
): Promise<FetchedChannel | null> {
  const identifier = extractYouTubeChannelIdentifier(url);

  if (!identifier) return null;

  const channel = await getYouTubeChannel(identifier);

  if (!channel) return null;

  const { platformSlug } = channelInput;
  const snippet = channel.snippet ?? {};
  const channelId = channel.id ?? "";

  const videosResult = await getYouTubeChannelVideos(channel, {
    maxResults: RECENT_VIDEOS_LIMIT,
  });

  const videos = videosResult.items.map((item) => {
    const videoSnippet = item.snippet ?? {};
    const videoId = videoSnippet.resourceId?.videoId ?? item.id ?? "";

    return {
      internalId: videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnailUrl:
        videoSnippet.thumbnails?.high?.url ??
        videoSnippet.thumbnails?.default?.url ??
        null,
      name: videoSnippet.title ?? "Untitled",
      description: videoSnippet.description ?? null,
    };
  });

  const subscribersCount = channel.statistics?.subscriberCount
    ? Number(channel.statistics.subscriberCount)
    : null;

  const videoCount = channel.statistics?.videoCount
    ? Number(channel.statistics.videoCount)
    : null;

  return {
    input: channelInput,
    data: {
      platformSlug,
      name: snippet.title ?? channelId,
      description: snippet.description ?? null,
      subscribersCount,
      videoCount,
      recentVideos: videos.map((v) => ({
        title: v.name,
        description: v.description,
      })),
    },
    internalId: channelId,
    slug: snippet.customUrl ?? null,
    avatarUrl:
      snippet.thumbnails?.high?.url ?? snippet.thumbnails?.default?.url ?? null,
    name: snippet.title ?? channelId,
    description: snippet.description ?? null,
    videos,
  };
}

async function fetchRuTubeChannelData(
  channelInput: ChannelInput,
  url: string,
): Promise<FetchedChannel | null> {
  const identifier = extractRuTubeChannelIdentifier(url);

  if (!identifier) return null;

  const channel = await getRuTubeUserProfile({
    author_id: identifier.authorId,
  });

  const videosPage = await getRuTubeVideosByAuthorId({
    author_id: identifier.authorId,
    params: { limit: RECENT_VIDEOS_LIMIT },
  });

  const videos = videosPage.results.map((item) => ({
    internalId: item.id,
    url: item.video_url ?? `https://rutube.ru/video/${item.id}/`,
    thumbnailUrl: item.thumbnail_url ?? null,
    name: item.title,
    description: item.description ?? null,
  }));

  return {
    input: channelInput,
    data: {
      platformSlug: channelInput.platformSlug,
      name: channel.name,
      description: channel.description ?? null,
      subscribersCount: channel.subscribers_count ?? null,
      videoCount: channel.video_count ?? null,
      recentVideos: videos.map((v) => ({
        title: v.name,
        description: v.description,
      })),
    },
    internalId: String(channel.id),
    slug: null,
    avatarUrl: channel.avatar_url ?? null,
    name: channel.name,
    description: channel.description ?? null,
    videos,
  };
}

export async function groupChannelsByCreator(
  fetchedChannels: FetchedChannel[],
): Promise<number[][]> {
  if (fetchedChannels.length === 1) {
    return [[0]];
  }

  const prompt = groupChannelsByCreatorPrompt({
    channels: fetchedChannels.map((channel) => ({
      platformSlug: channel.data.platformSlug,
      name: channel.data.name,
      description: channel.data.description,
      recentVideoTitles: channel.data.recentVideos.map((v) => v.title),
    })),
  });

  try {
    const { output_parsed } = await polzaAI.responses.parse({
      model: envs.POLZA_AI_STRUCTURED_OUTPUT_MODEL,
      temperature: 0.1,
      input: [
        { role: "system", content: systemPrompt() },
        { role: "user", content: prompt },
      ],
      text: {
        format: zodTextFormat(channelGroupsGeneratedSchema, "channelGroups"),
      },
    });

    if (!output_parsed) {
      return fetchedChannels.map((_, i) => [i]);
    }

    const allIndicesSet = new Set(fetchedChannels.map((_, i) => i));
    const coveredIndicesSet = new Set(output_parsed.groups.flat());
    const coveredIndicesArray = Array.from(coveredIndicesSet);

    const isValid =
      coveredIndicesSet.size === allIndicesSet.size &&
      coveredIndicesArray.every((i) => coveredIndicesSet.has(i));

    if (isValid) {
      return output_parsed.groups;
    }

    return fetchedChannels.map((_, i) => [i]);
  } catch {
    return fetchedChannels.map((_, i) => [i]);
  }
}
