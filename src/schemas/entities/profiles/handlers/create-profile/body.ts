import { z } from "@/lib/zod";

import { profilesRegistry } from "../../registry";

export const createProfileBodySchema = z
  .object({
    name: z
      .string()
      .min(1, "Название должно быть не менее 1 символа")
      .max(256, "Название должно быть не более 256 символов"),
    description: z
      .string()
      .min(64, "Описание должно быть не менее 128 символов")
      .max(8192, "Описание должно быть не более 8192 символов"),
    targetAudience: z
      .string()
      .min(1, "Описание целевой аудитории должно быть не менее 1 символа")
      .max(
        1024,
        "Описание целевой аудитории должно быть не более 1024 символов",
      )
      .optional(),
    typeId: z.string().uuid("Некорректный формат идентификатора типа профиля"),
    toneIds: z
      .array(z.string().uuid("Некорректный формат идентификатора тональности"))
      .optional(),
    platformIds: z
      .array(z.string().uuid("Некорректный формат идентификатора платформы"))
      .optional(),
  })
  .register(profilesRegistry, {
    title: "Create profile body",
    description: "Create profile body description",
    ref: "CreateProfileBodySchema",
  });

export type CreateProfileBody = z.infer<typeof createProfileBodySchema>;
