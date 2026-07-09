import type { SocialKitVideoPlatformSlug } from "@/lib/socialkit/types/video-platform-slug";

import {
  requestVideoSummarize,
  requestVideoTranscript,
} from "./request-video-enrichment";

export type ProfileChannelVideoSummarizeData = {
  summary: string | null;
  mainTopics: string[] | null;
  keyPoints: string[] | null;
  tone: string | null;
  targetAudience: string | null;
  quotes: string[] | null;
};

export type ProfileChannelVideoTranscriptData = {
  transcript: string | null;
  transcriptSegments: Record<string, unknown>[] | null;
  wordCount: number | null;
  segments: number | null;
  timeline: string | null;
};

type FetchProfileChannelVideoEnrichmentParams = {
  url: string;
  platformSlug: SocialKitVideoPlatformSlug;
};

export async function fetchProfileChannelVideoSummarize({
  url,
  platformSlug,
}: FetchProfileChannelVideoEnrichmentParams): Promise<ProfileChannelVideoSummarizeData> {
  const response = await requestVideoSummarize({ url, platformSlug });
  const data = response.data;

  return {
    summary: data?.summary ?? null,
    mainTopics: data?.mainTopics ?? null,
    keyPoints: data?.keyPoints ?? null,
    tone: data?.tone ?? null,
    targetAudience: data?.targetAudience ?? null,
    quotes: data?.quotes ?? null,
  };
}

export async function fetchProfileChannelVideoTranscript({
  url,
  platformSlug,
}: FetchProfileChannelVideoEnrichmentParams): Promise<ProfileChannelVideoTranscriptData> {
  const response = await requestVideoTranscript({ url, platformSlug });
  const data = response.data;

  return {
    transcript: data?.transcript ?? null,
    transcriptSegments: data?.transcriptSegments ?? null,
    wordCount: data?.wordCount ?? null,
    segments: data?.segments ?? null,
    timeline: null,
  };
}
