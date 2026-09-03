import { postInstagramChannelReels } from "@/codegen/api/socialkit/clients/post-instagram-channel-reels";
import { postTiktokChannelVideos } from "@/codegen/api/socialkit/clients/post-tiktok-channel-videos";
import { postYoutubeVideos } from "@/codegen/api/socialkit/clients/post-youtube-videos";
import type { SocialKitVideoPlatformSlug } from "@/lib/socialkit/types/video-platform-slug";
import { mapSocialKitApiError } from "@/lib/socialkit/utils/map-socialkit-api-error";

export type ProfileChannelVideoListItem = {
  externalId: string | null;
  url: string | null;
  thumbnailUrl: string | null;
  name: string | null;
  description: string | null;
  likes: number | null;
  views: number | null;
  comments: number | null;
  duration: string | null;
};

type FetchProfileChannelVideosParams = {
  url: string;
  platformSlug: SocialKitVideoPlatformSlug;
  limit: number;
};

export async function fetchProfileChannelVideos({
  url,
  platformSlug,
  limit,
}: FetchProfileChannelVideosParams): Promise<ProfileChannelVideoListItem[]> {
  try {
    switch (platformSlug) {
      case "youtube": {
        const response = await postYoutubeVideos({
          params: { url, limit },
        });

        const results = response.data?.results ?? [];

        return results.map((item) => ({
          externalId: item.videoId ?? null,
          url: item.url ?? null,
          thumbnailUrl: item.thumbnail ?? null,
          name: item.title ?? null,
          description: null,
          likes: null,
          views: item.views ?? null,
          comments: null,
          duration: item.duration ?? null,
        }));
      }

      case "instagram": {
        const response = await postInstagramChannelReels({
          params: { url, limit },
        });

        const items = response.data?.items ?? [];

        return items.map((item) => ({
          externalId: item.id ?? item.shortcode ?? null,
          url: item.url ?? null,
          thumbnailUrl: item.thumbnailUrl ?? null,
          name: item.caption ?? item.shortcode ?? item.id ?? null,
          description: item.caption ?? null,
          likes: item.likes ?? null,
          views: item.views ?? null,
          comments: item.comments ?? null,
          duration: item.duration != null ? String(item.duration) : null,
        }));
      }

      case "tiktok": {
        const response = await postTiktokChannelVideos({
          params: { url, limit },
        });

        const results = response.data?.results ?? [];

        return results.map((item) => ({
          externalId: item.videoId ?? null,
          url: item.url ?? null,
          thumbnailUrl: item.thumbnail ?? null,
          name: item.description ?? null,
          description: item.description ?? null,
          likes: item.likes ?? null,
          views: item.views ?? null,
          comments: item.comments ?? null,
          duration: item.duration != null ? String(item.duration) : null,
        }));
      }
    }
  } catch (error) {
    throw mapSocialKitApiError(error);
  }
}
