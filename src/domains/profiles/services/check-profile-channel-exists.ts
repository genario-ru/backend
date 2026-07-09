import { getUserProfile as getRuTubeUserProfile } from "@/codegen/api/rutube/clients";
import { extractRuTubeChannelIdentifier } from "@/lib/rutube";
import {
  extractYouTubeChannelIdentifier,
  getYouTubeChannel,
} from "@/lib/youtube";

type CheckProfileChannelExistsParams = {
  url: string;
  platformSlug: string;
};

export async function checkProfileChannelExists({
  url,
  platformSlug,
}: CheckProfileChannelExistsParams): Promise<boolean> {
  switch (platformSlug) {
    case "youtube":
      const youTubeIdentifier = extractYouTubeChannelIdentifier(url);

      if (!youTubeIdentifier) return false;

      const youTubeChannel = await getYouTubeChannel(youTubeIdentifier).catch(
        (error) => {
          console.error("Error getting YouTube channel", error);
          return null;
        },
      );

      return youTubeChannel !== null;

    case "rutube":
      const identifier = extractRuTubeChannelIdentifier(url);

      if (!identifier) return false;

      const ruTubeChannel = await getRuTubeUserProfile({
        author_id: identifier.authorId,
      }).catch((error) => {
        console.error("Error getting RuTube channel", error);
        return null;
      });

      return ruTubeChannel !== null;

    default:
      return false;
  }
}
