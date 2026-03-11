// Сохраняем кириллицу и латиницу в имени файла, а все разделители
// приводим к одному безопасному `-`, чтобы ключи в S3 и имена файлов
// оставались читабельными и предсказуемыми.
export function slugifyFileName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}
