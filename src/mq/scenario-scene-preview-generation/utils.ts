type ResolvedImageSize = "1024x1024" | "1024x1536" | "1536x1024";

export function resolveImageSize(
  videoTypeSlug: string | undefined,
): ResolvedImageSize {
  switch (videoTypeSlug) {
    case "short":
      return "1024x1536";
    case "long":
      return "1536x1024";
    default:
      return "1024x1024";
  }
}
