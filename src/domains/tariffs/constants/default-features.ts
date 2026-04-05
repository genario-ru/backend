import type { TariffFeature } from "@/domains/tariffs/schemas/entities/tariff-feature";

export const defaultFeatures: TariffFeature[] = [
  {
    text: "Генерация идей для видео",
    included: true,
  },
  {
    text: "Генерация и редактирование сценариев",
    included: true,
  },
  {
    text: "Полезные шаблоны для идей и видео",
    included: true,
  },
  {
    text: "Настройка под разные видео-платформы",
    included: true,
  },
];
