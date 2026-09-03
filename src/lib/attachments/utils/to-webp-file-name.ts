import { posix } from "node:path";

type ToWebpFileNameParams = {
  fileName: string;
};

export function toWebpFileName({ fileName }: ToWebpFileNameParams): string {
  const extension = posix.extname(fileName);
  const stem = extension ? fileName.slice(0, -extension.length) : fileName;

  return `${stem}.webp`;
}
