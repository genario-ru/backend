import { z } from "@/lib/zod";

export const createProfileBodySchema = z
  .object({
    name: z
      .string()
      .min(1, "Название должно быть не менее 1 символа")
      .max(256, "Название должно быть не более 256 символов"),
    positioning: z
      .string()
      .max(8192, "Позиционирование должно быть не более 8192 символов")
      .optional(),
    targetAudience: z
      .string()
      .max(
        1024,
        "Описание целевой аудитории должно быть не более 1024 символов",
      )
      .optional(),
    additionalInfo: z
      .string()
      .max(8192, "Дополнительная информация должна быть не более 8192 символов")
      .optional(),
    typeId: z.string().uuid("Некорректный формат идентификатора типа профиля"),
    platformIds: z
      .array(z.string().uuid("Некорректный формат идентификатора платформы"))
      .optional(),
  })
  .meta({
    title: "Create profile body",
    description: "Create profile body description",
    ref: "CreateProfileBodySchema",
  });

export type CreateProfileBody = z.infer<typeof createProfileBodySchema>;
