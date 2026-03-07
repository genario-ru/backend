import type { Tariff } from "@/schemas/entities/tariffs/entities/tariff";
import type { TariffFeature } from "@/schemas/entities/tariffs/entities/tariff-feature";
import { ruPluralForm } from "@/utils/intl/ru-plural-form";

type PrepareTariffFeaturesForUIParams = Pick<
  Tariff,
  | "creditsAmount"
  | "maxProfilesAmount"
  | "durationDays"
  | "exportAvailable"
  | "generationPriority"
  | "versionHistoryAvailable"
>;

type PrepareTariffFeaturesForUIReturn = TariffFeature[];

export function prepareTariffFeaturesForUI({
  creditsAmount,
  maxProfilesAmount,
  durationDays,
  exportAvailable,
  generationPriority,
  versionHistoryAvailable,
}: PrepareTariffFeaturesForUIParams): PrepareTariffFeaturesForUIReturn {
  const features: PrepareTariffFeaturesForUIReturn = [
    {
      text: ruPluralForm({
        count: creditsAmount,
        one: "%d кредит для генераций",
        few: "%d кредита для генераций",
        many: "%d кредитов для генераций",
      }),
      included: true,
    },
    {
      text: ruPluralForm({
        count: maxProfilesAmount,
        one: "%d профиль для вашего канала",
        few: "%d профиля для ваших каналов",
        many: "%d профилей для ваших каналов",
        none: "Неограниченное количество профилей",
      }),
      included: true,
    },
  ];

  if (durationDays) {
    features.push({
      text: ruPluralForm({
        count: durationDays,
        one: "%d день доступа",
        few: "%d дня доступа",
        many: "%d дней доступа",
      }),
      included: true,
    });
  }

  features.push(
    {
      text: getGenerationPriorityText(generationPriority),
      included: true,
    },
    {
      text: "Экспорт результатов генераций",
      included: exportAvailable,
    },
    {
      text: "История версий сценария",
      included: versionHistoryAvailable,
    },
  );

  return features;
}

function getGenerationPriorityText(
  generationPriority: Tariff["generationPriority"],
) {
  switch (generationPriority) {
    case "high":
      return "Наивысший приоритет генераций";

    case "medium":
      return "Повышенный приоритет генераций";

    default:
      return "Базовый приоритет генераций";
  }
}
