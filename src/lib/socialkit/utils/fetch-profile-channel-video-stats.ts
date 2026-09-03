import { postInstagramStats } from "@/codegen/api/socialkit/clients/post-instagram-stats";
import { postTiktokStats } from "@/codegen/api/socialkit/clients/post-tiktok-stats";
import { postYoutubeStats } from "@/codegen/api/socialkit/clients/post-youtube-stats";
import type { SocialKitVideoPlatformSlug } from "@/lib/socialkit/types/video-platform-slug";
import { mapSocialKitApiError } from "@/lib/socialkit/utils/map-socialkit-api-error";

export type ProfileChannelVideoStatsData = {
  externalId: string | null;
  url: string;
  thumbnailUrl: string | null;
  name: string | null;
  description: string | null;
  likes: number | null;
  views: number | null;
  comments: number | null;
  duration: string | null;
};

type FetchProfileChannelVideoStatsParams = {
  url: string;
  platformSlug: SocialKitVideoPlatformSlug;
};

export async function fetchProfileChannelVideoStats({
  url,
  platformSlug,
}: FetchProfileChannelVideoStatsParams): Promise<ProfileChannelVideoStatsData> {
  try {
    switch (platformSlug) {
      case "youtube": {
        const response = await postYoutubeStats({ params: { url } });
        const stats = response.data;

        return {
          externalId: stats?.videoId ?? null,
          url: stats?.url ?? url,
          thumbnailUrl: stats?.thumbnailUrl ?? null,
          name: stats?.title ?? null,
          description: stats?.description ?? null,
          likes: stats?.likes ?? null,
          views: stats?.views ?? null,
          comments: stats?.comments ?? null,
          duration: stats?.duration ?? null,
        };
      }

      case "instagram": {
        const response = await postInstagramStats({ params: { url } });
        const stats = response.data;

        return {
          externalId: stats?.id ?? stats?.shortcode ?? null,
          url: stats?.postUrl ?? url,
          thumbnailUrl: stats?.thumbnail ?? null,
          name: stats?.title ?? null,
          description: stats?.description ?? null,
          likes: stats?.likes ?? null,
          views: stats?.views ?? null,
          comments: stats?.comments ?? null,
          duration: stats?.duration ?? null,
        };
      }

      case "tiktok": {
        const response = await postTiktokStats({ params: { url } });
        const stats = response.data;

        return {
          externalId: stats?.videoId ?? null,
          url: stats?.url ?? url,
          thumbnailUrl: stats?.thumbnailUrl ?? null,
          name: stats?.title ?? null,
          description: stats?.description ?? null,
          likes: stats?.likes ?? null,
          views: stats?.views ?? null,
          comments: stats?.comments ?? null,
          duration: stats?.duration ?? null,
        };
      }
    }
  } catch (error) {
    throw mapSocialKitApiError(error);
  }
}
