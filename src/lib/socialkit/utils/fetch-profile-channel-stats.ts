import { postInstagramChannelStats } from "@/codegen/api/socialkit/clients/post-instagram-channel-stats";
import { postTiktokChannelStats } from "@/codegen/api/socialkit/clients/post-tiktok-channel-stats";
import { postYoutubeChannelStats } from "@/codegen/api/socialkit/clients/post-youtube-channel-stats";
import type { SocialKitVideoPlatformSlug } from "@/lib/socialkit/types/video-platform-slug";
import { mapSocialKitApiError } from "@/lib/socialkit/utils/map-socialkit-api-error";

export type ProfileChannelStatsData = {
  externalId: string | null;
  slug: string | null;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  verified: boolean | null;
  followers: number | null;
  following: number | null;
  totalPosts: number | null;
};

type FetchProfileChannelStatsParams = {
  url: string;
  platformSlug: SocialKitVideoPlatformSlug;
};

export async function fetchProfileChannelStats({
  url,
  platformSlug,
}: FetchProfileChannelStatsParams): Promise<ProfileChannelStatsData> {
  try {
    switch (platformSlug) {
      case "youtube": {
        const response = await postYoutubeChannelStats({ params: { url } });
        const stats = response.data;

        if (!stats) {
          throw new Error("YouTube channel stats not found");
        }

        return {
          externalId: stats.username ?? null,
          slug: stats.username ?? null,
          name: stats.nickname ?? stats.username ?? "YouTube Channel",
          description: stats.bio ?? null,
          avatarUrl: stats.avatar ?? null,
          verified: stats.verified ?? null,
          followers: stats.subscribers ?? null,
          following: null,
          totalPosts: stats.totalVideos ?? null,
        };
      }

      case "instagram": {
        const response = await postInstagramChannelStats({ params: { url } });
        const stats = response.data;

        if (!stats) {
          throw new Error("Instagram channel stats not found");
        }

        return {
          externalId: stats.username ?? null,
          slug: stats.username ?? null,
          name: stats.fullName ?? stats.username ?? "Instagram Profile",
          description: stats.bio ?? null,
          avatarUrl: stats.avatar ?? null,
          verified: stats.verified ?? null,
          followers: stats.followers ?? null,
          following: stats.following ?? null,
          totalPosts: stats.totalPosts ?? null,
        };
      }

      case "tiktok": {
        const response = await postTiktokChannelStats({ params: { url } });
        const stats = response.data;

        if (!stats) {
          throw new Error("TikTok channel stats not found");
        }

        return {
          externalId: stats.username ?? null,
          slug: stats.username ?? null,
          name: stats.nickname ?? stats.username ?? "TikTok Channel",
          description: stats.signature ?? null,
          avatarUrl: stats.avatar ?? null,
          verified: stats.verified ?? null,
          followers: stats.followers ?? null,
          following: stats.following ?? null,
          totalPosts: stats.totalVideos ?? null,
        };
      }
    }
  } catch (error) {
    throw mapSocialKitApiError(error);
  }
}
