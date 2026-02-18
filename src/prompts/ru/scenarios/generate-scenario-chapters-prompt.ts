type GenerateScenarioChaptersPromptProps = {
  context: {
    scenarioName?: string | null;
    scenarioDescription?: string | null;
    scenarioTargetAudience?: string | null;
    scenarioTemplateName?: string | null;
    scenarioTemplateDescription?: string | null;
    scenarioProfileName?: string | null;
    scenarioProfileDescription?: string | null;
    scenarioPlatformName?: string | null;
    scenarioVideoTypeName?: string | null;
    scenarioVideoDurationName?: string | null;
    scenarioMinimumDurationSeconds?: number | null;
    scenarioMaximumDurationSeconds?: number | null;
    scenarioTones?: string[];
  };
};

export function generateScenarioChaptersPrompt({
  context,
}: GenerateScenarioChaptersPromptProps) {
  const {
    scenarioName,
    scenarioDescription,
    scenarioTargetAudience,
    scenarioTemplateName,
    scenarioTemplateDescription,
    scenarioProfileName,
    scenarioProfileDescription,
    scenarioPlatformName,
    scenarioVideoTypeName,
    scenarioVideoDurationName,
    scenarioMinimumDurationSeconds,
    scenarioMaximumDurationSeconds,
    scenarioTones,
  } = context;

  return `
    # Инструкции:
    - Сгенерируй разделы сценария на основе предоставленного контекста и данных

    # Контекст:
    - Название сценария: "${scenarioName}"
    - Описание сценария: "${scenarioDescription}"
    - Целевая аудитория сценария: "${scenarioTargetAudience}"
    - Название шаблона сценария: "${scenarioTemplateName}"
    - Описание шаблона сценария: "${scenarioTemplateDescription}"
    - Название профиля сценария: "${scenarioProfileName}"
    - Описание профиля сценария: "${scenarioProfileDescription}"
    - Название платформы сценария: "${scenarioPlatformName}"
    - Название типа видео сценария: "${scenarioVideoTypeName}"
    - Название продолжительности видео сценария: "${scenarioVideoDurationName}"
    - Минимальная продолжительность сценария в секундах: ${scenarioMinimumDurationSeconds}
    - Максимальная продолжительность сценария в секундах: ${scenarioMaximumDurationSeconds}
    - Тональности сценария: ${scenarioTones?.join(", ")}

    # Правила:
    - Первый раздел должен начинаться в ${scenarioMinimumDurationSeconds}, последний — заканчиваться в ${scenarioMaximumDurationSeconds}
    - У каждого раздела должен быть уникальный угол подачи
    - Разделы должны идти в хронологическом порядке и не пересекаться
  `;
}
