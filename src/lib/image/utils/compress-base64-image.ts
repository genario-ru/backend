import sharp from "sharp";

export async function compressBase64Image(
  base64: string,
  options?: {
    maxWidth?: number;
    quality?: number;
  },
): Promise<{ buffer: Buffer; mimeType: string }> {
  const { maxWidth = 240, quality = 20 } = options ?? {};

  const inputBuffer = Buffer.from(base64, "base64");

  const compressedBuffer = await sharp(inputBuffer)
    .resize(maxWidth, null, { withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();

  return {
    buffer: compressedBuffer,
    mimeType: "image/webp",
  };
}
