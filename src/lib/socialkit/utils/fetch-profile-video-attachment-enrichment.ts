import { postVideoSummarize } from "@/codegen/api/socialkit/clients/post-video-summarize";
import { postVideoTranscript } from "@/codegen/api/socialkit/clients/post-video-transcript";

export type ProfileVideoAttachmentSummarizeData = {
  summary: string | null;
  mainTopics: string[] | null;
  keyPoints: string[] | null;
  tone: string | null;
  targetAudience: string | null;
  quotes: string[] | null;
};

export type ProfileVideoAttachmentTranscriptData = {
  transcript: string | null;
  transcriptSegments: Record<string, unknown>[] | null;
  wordCount: number | null;
  segments: number | null;
  timeline: string | null;
};

type FetchProfileVideoAttachmentEnrichmentParams = {
  url: string;
};

export async function fetchProfileVideoAttachmentSummarize({
  url,
}: FetchProfileVideoAttachmentEnrichmentParams): Promise<ProfileVideoAttachmentSummarizeData> {
  const response = await postVideoSummarize({ params: { url } });
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

export async function fetchProfileVideoAttachmentTranscript({
  url,
}: FetchProfileVideoAttachmentEnrichmentParams): Promise<ProfileVideoAttachmentTranscriptData> {
  const response = await postVideoTranscript({ params: { url } });
  const data = response.data;

  return {
    transcript: data?.transcript ?? null,
    transcriptSegments: data?.transcriptSegments ?? null,
    wordCount: data?.wordCount ?? null,
    segments: data?.segments ?? null,
    timeline: null,
  };
}
