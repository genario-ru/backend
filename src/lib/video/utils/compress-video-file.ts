import { execa } from "execa";

import { resolveFfmpegPath } from "./resolve-ffmpeg-path";

const FFMPEG_TIMEOUT_MS = 30 * 60 * 1000;
const OUTPUT_MIME_TYPE = "video/mp4";

type CompressVideoFileParams = {
  inputFilePath: string;
  outputFilePath: string;
};

export async function compressVideoFile({
  inputFilePath,
  outputFilePath,
}: CompressVideoFileParams): Promise<{ mimeType: string }> {
  const ffmpegPath = resolveFfmpegPath();

  const subprocess = execa(
    ffmpegPath,
    [
      "-threads",
      "2",
      "-i",
      inputFilePath,
      "-vf",
      "scale='min(1920,iw)':-2",
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "23",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-movflags",
      "+faststart",
      "-y",
      outputFilePath,
    ],
    {
      timeout: FFMPEG_TIMEOUT_MS,
      killSignal: "SIGKILL",
    },
  );

  await subprocess;

  return {
    mimeType: OUTPUT_MIME_TYPE,
  };
}
