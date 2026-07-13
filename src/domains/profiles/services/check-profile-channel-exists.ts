import {
  isSocialKitVideoPlatformSlug,
  type SocialKitVideoPlatformSlug,
} from "@/lib/socialkit/types/video-platform-slug";
import { fetchProfileChannelStats } from "@/lib/socialkit/utils/fetch-profile-channel-stats";

type CheckProfileChannelExistsParams = {
  url: string;
  platformSlug: string;
};

export async function checkProfileChannelExists({
  url,
  platformSlug,
}: CheckProfileChannelExistsParams): Promise<boolean> {
  if (!isSocialKitVideoPlatformSlug(platformSlug)) {
    return false;
  }

  const socialKitPlatformSlug: SocialKitVideoPlatformSlug = platformSlug;

  return fetchProfileChannelStats({
    url,
    platformSlug: socialKitPlatformSlug,
  })
    .then((stats) => stats.name.length > 0)
    .catch((error) => {
      console.error("Error getting channel stats from SocialKit", {
        platformSlug,
        error,
      });

      return false;
    });
}
