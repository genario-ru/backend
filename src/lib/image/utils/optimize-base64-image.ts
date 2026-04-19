import sharp from "sharp";

export async function optimizeBase64Image(
  base64: string,
  options?: {
    maxWidth?: number;
    quality?: number;
  },
): Promise<{ buffer: Buffer; mimeType: string }> {
  const { maxWidth, quality = 82 } = options ?? {};

  const inputBuffer = Buffer.from(base64, "base64");

  let pipeline = sharp(inputBuffer);

  if (maxWidth) {
    pipeline = pipeline.resize(maxWidth, null, { withoutEnlargement: true });
  }

  const optimizedBuffer = await pipeline
    .webp({ quality, effort: 4 })
    .toBuffer();

  return {
    buffer: optimizedBuffer,
    mimeType: "image/webp",
  };
}
