import { postInstagramSummarize } from "@/codegen/api/socialkit/clients/post-instagram-summarize";
import { postInstagramTranscript } from "@/codegen/api/socialkit/clients/post-instagram-transcript";
import { postTiktokSummarize } from "@/codegen/api/socialkit/clients/post-tiktok-summarize";
import { postTiktokTranscript } from "@/codegen/api/socialkit/clients/post-tiktok-transcript";
import { postYoutubeSummarize } from "@/codegen/api/socialkit/clients/post-youtube-summarize";
import { postYoutubeTranscript } from "@/codegen/api/socialkit/clients/post-youtube-transcript";
import type { SocialKitVideoPlatformSlug } from "@/lib/socialkit/types/video-platform-slug";

type RequestVideoEnrichmentParams = {
  url: string;
  platformSlug: SocialKitVideoPlatformSlug;
};

export function requestVideoSummarize({
  url,
  platformSlug,
}: RequestVideoEnrichmentParams) {
  switch (platformSlug) {
    case "youtube":
      return postYoutubeSummarize({ params: { url } });
    case "instagram":
      return postInstagramSummarize({ params: { url } });
    case "tiktok":
      return postTiktokSummarize({ params: { url } });
  }
}

export function requestVideoTranscript({
  url,
  platformSlug,
}: RequestVideoEnrichmentParams) {
  switch (platformSlug) {
    case "youtube":
      return postYoutubeTranscript({ params: { url } });
    case "instagram":
      return postInstagramTranscript({ params: { url } });
    case "tiktok":
      return postTiktokTranscript({ params: { url } });
  }
}
