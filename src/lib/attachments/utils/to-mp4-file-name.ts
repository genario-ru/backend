import { posix } from "node:path";

type ToMp4FileNameParams = {
  fileName: string;
};

export function toMp4FileName({ fileName }: ToMp4FileNameParams): string {
  const extension = posix.extname(fileName);
  const stem = extension ? fileName.slice(0, -extension.length) : fileName;

  return `${stem}.mp4`;
}
