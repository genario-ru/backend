import ffmpegStatic from "ffmpeg-static";

export function resolveFfmpegPath(): string {
  if (ffmpegStatic) {
    return ffmpegStatic;
  }

  return "ffmpeg";
}
