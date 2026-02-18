type GenerateScenarioScenesPromptProps = {
  context: {
    scenarioName?: string | null;
    scenarioDescription?: string | null;
    scenarioTargetAudience?: string | null;
    chapterName: string;
    chapterDescription?: string | null;
    chapterStartTime: number;
    chapterEndTime: number;
    scenarioChaptersTimeline?: {
      id: string;
      name: string;
      description?: string | null;
      startTime: number;
      endTime: number;
    }[];
    alreadyGeneratedScenesByChapter?: {
      chapterId: string;
      chapterName: string;
      scenes: {
        id: string;
        name: string;
        description?: string | null;
        startTime: number;
        endTime: number;
      }[];
    }[];
  };
};

export function generateScenarioScenesPrompt({
  context,
}: GenerateScenarioScenesPromptProps) {
  const {
    scenarioName,
    scenarioDescription,
    scenarioTargetAudience,
    chapterName,
    chapterDescription,
    chapterStartTime,
    chapterEndTime,
    scenarioChaptersTimeline,
    alreadyGeneratedScenesByChapter,
  } = context;

  return `
    # Инструкции:
    - Сгенерируй сцены сценария для раздела на основе предоставленного контекста и данных

    # Контекст:
    - Название сценария: "${scenarioName}"
    - Описание сценария: "${scenarioDescription}"
    - Целевая аудитория сценария: "${scenarioTargetAudience}"
    - Название раздела: "${chapterName}"
    - Описание раздела: "${chapterDescription}"
    - Время начала раздела: ${chapterStartTime}
    - Время окончания раздела: ${chapterEndTime}

    # Данные:
    - Временная шкала разделов сценария: ${JSON.stringify(scenarioChaptersTimeline ?? [])};
    - Уже сгенерированные сцены для других разделов: ${JSON.stringify(alreadyGeneratedScenesByChapter ?? [])}

    # Правила:
    - Первая сцена должна начинаться в ${chapterStartTime}, последняя — заканчиваться в ${chapterEndTime}
    - У каждой сцены должен быть уникальный угол подачи
    - Время начала/окончания должно быть целым числом в секундах в пределах раздела
    - Сцены должны идти в хронологическом порядке и не пересекаться
    - Сохраняй повествовательную преемственность с полной временной шкалой сценария и избегай повторения той же идеи сцены, которая уже есть в других разделах
  `;
}
