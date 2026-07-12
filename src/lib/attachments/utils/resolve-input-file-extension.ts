import { posix } from "node:path";

type ResolveInputFileExtensionParams = {
  fileName: string;
};

export function resolveInputFileExtension({
  fileName,
}: ResolveInputFileExtensionParams): string {
  const extension = posix.extname(fileName);

  if (extension) {
    return extension;
  }

  return ".mp4";
}
