import ffmpeg from "fluent-ffmpeg";

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
  return new Promise((resolve, reject) => {
    const command = ffmpeg(inputFilePath)
      .outputOptions([
        "-threads 2",
        "-c:v libx264",
        "-preset fast",
        "-crf 23",
        "-c:a aac",
        "-b:a 128k",
        "-movflags +faststart",
      ])
      .videoFilters("scale='min(1920,iw)':-2")
      .output(outputFilePath);

    const timeoutId = setTimeout(() => {
      command.kill("SIGKILL");
      reject(new Error("Превышено время обработки видео"));
    }, FFMPEG_TIMEOUT_MS);

    command
      .on("end", () => {
        clearTimeout(timeoutId);
        resolve({ mimeType: OUTPUT_MIME_TYPE });
      })
      .on("error", (error) => {
        clearTimeout(timeoutId);
        reject(error);
      })
      .run();
  });
}
