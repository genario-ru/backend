import sharp from "sharp";

const DEFAULT_MAX_WIDTH = 1920;
const DEFAULT_QUALITY = 82;

type OptimizeImageBufferParams = {
  buffer: Buffer;
  maxWidth?: number;
  quality?: number;
};

export async function optimizeImageBuffer({
  buffer,
  maxWidth = DEFAULT_MAX_WIDTH,
  quality = DEFAULT_QUALITY,
}: OptimizeImageBufferParams): Promise<{ buffer: Buffer; mimeType: string }> {
  const optimizedBuffer = await sharp(buffer)
    .resize(maxWidth, null, { withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toBuffer();

  return {
    buffer: optimizedBuffer,
    mimeType: "image/webp",
  };
}
