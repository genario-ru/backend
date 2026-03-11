// Общий результат document-renderer'а: готовый бинарный файл и его метаданные.
export type RenderedDocumentFile = {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
};
