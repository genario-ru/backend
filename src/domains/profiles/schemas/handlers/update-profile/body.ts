import { z } from "@/lib/zod";

export const updateProfileBodySchema = z
  .object({
    name: z
      .string()
      .min(1, "Название должно быть не менее 1 символа")
      .max(256, "Название должно быть не более 256 символов")
      .optional(),
    positioning: z
      .string()
      .max(8192, "Позиционирование должно быть не более 8192 символов")
      .nullable()
      .optional(),
    targetAudience: z
      .string()
      .max(
        1024,
        "Описание целевой аудитории должно быть не более 1024 символов",
      )
      .nullable()
      .optional(),
    additionalInfo: z
      .string()
      .max(8192, "Дополнительная информация должна быть не более 8192 символов")
      .nullable()
      .optional(),
    typeId: z
      .string()
      .uuid("Некорректный формат идентификатора типа профиля")
      .nullable()
      .optional(),
    platformIds: z
      .array(z.string().uuid("Некорректный формат идентификатора платформы"))
      .optional(),
  })
  .meta({
    title: "Update profile body",
    description: "Update profile body description",
    ref: "UpdateProfileBodySchema",
  });

export type UpdateProfileBody = z.infer<typeof updateProfileBodySchema>;
