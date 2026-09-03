export type SocialKitVideoPlatformSlug = "youtube" | "instagram" | "tiktok";

export const SOCIALKIT_VIDEO_PLATFORM_SLUGS: SocialKitVideoPlatformSlug[] = [
  "youtube",
  "instagram",
  "tiktok",
];

export function isSocialKitVideoPlatformSlug(
  slug: string,
): slug is SocialKitVideoPlatformSlug {
  return SOCIALKIT_VIDEO_PLATFORM_SLUGS.includes(
    slug as SocialKitVideoPlatformSlug,
  );
}
