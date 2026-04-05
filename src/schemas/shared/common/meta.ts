import { z } from "@/lib/zod";

export const queryMetaSchema = z
  .object({
    q: z.string().optional().describe("Строка поиска"),
    page: z.coerce.number().optional().describe("Номер страницы"),
    perPage: z.coerce
      .number()
      .optional()
      .describe("Количество элементов в одной странице ответа"),
    sortOrder: z.enum(["asc", "desc"]).optional().describe("Вид сортировки"),
    sortBy: z.string().optional().describe("Поле для сортировки"),
  })
  .meta({
    title: "Query meta",
    description: "Query meta description",
    ref: "QueryMetaSchema",
  });

export const responseMetaSchema = z
  .object({
    previousPage: z.number().nullable().describe("Номер предыдущей страницы"),
    currentPage: z.number().describe("Номер текущей страницы"),
    nextPage: z.number().nullable().describe("Номер следующей страницы"),
    perPage: z
      .number()
      .describe("Количество элементов в одной странице ответа"),
    totalItems: z.number().describe("Общее количество элементов по запросу"),
    totalPages: z.number().describe("Общее количество страниц по запросу"),
    sortOrder: z.enum(["asc", "desc"]).describe("Вид сортировки"),
    sortBy: z.string().describe("Поле для сортировки"),
    q: z.string().optional().describe("Строка поиска"),
  })
  .meta({
    title: "Response meta",
    description: "Response meta description",
    ref: "ResponseMetaSchema",
  });
