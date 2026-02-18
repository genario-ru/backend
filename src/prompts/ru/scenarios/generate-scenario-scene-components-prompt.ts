type GenerateScenarioSceneComponentsPromptProps = {
  context: {
    scenarioName: string;
    scenarioDescription: string;
    scenarioTargetAudience: string;
    chapterName: string;
    chapterDescription: string;
    chapterStartTime: number;
    chapterEndTime: number;
    sceneName: string;
    sceneDescription: string;
    sceneStartTime: number;
    sceneEndTime: number;
    scenarioChaptersTimeline?: {
      id: string;
      name: string;
      startTime: number;
      endTime: number;
    }[];
    chapterScenesTimeline?: {
      id: string;
      name: string;
      description?: string | null;
      startTime: number;
      endTime: number;
    }[];
    scenePositionInChapter?: {
      index: number;
      total: number;
    };
    alreadyGeneratedComponentsFromPreviousScenes?: {
      sceneId: string;
      sceneName: string;
      components: {
        name: string;
        typeId: string;
        content?: string | null;
      }[];
    }[];
    availableSceneComponentTypes: {
      id: string;
      name: string;
      description: string | null;
      optional: boolean;
    }[];
  };
};

export function generateScenarioSceneComponentsPrompt({
  context,
}: GenerateScenarioSceneComponentsPromptProps) {
  const {
    scenarioName,
    scenarioDescription,
    scenarioTargetAudience,
    chapterName,
    chapterDescription,
    chapterStartTime,
    chapterEndTime,
    sceneName,
    sceneDescription,
    sceneStartTime,
    sceneEndTime,
    scenarioChaptersTimeline,
    chapterScenesTimeline,
    scenePositionInChapter,
    alreadyGeneratedComponentsFromPreviousScenes,
    availableSceneComponentTypes,
  } = context;

  return `
    # Инструкции:
    - Сгенерируй компоненты для сцены на основе предоставленного контекста и данных
    - Каждый компонент сцены - представление данной сцены в том или ином виде
    - Компоненты сцены, включающие в себя текст, который будет показан или озвучен, должны быть уже готовы к озвучке / демонстрации, то есть пользователь не должен додумывать абсолютно ничего
    - Компоненты сцены, включающие в себя текст, который будет показан или озвучен, должны ссылаться на компоненты предыдущих сцен, чтоб не повторяться, не приветствовать зрителя вновь, не уходить от заданного стиля

    # Контекст:
    - Название сценария: "${scenarioName}"
    - Описание сценария: "${scenarioDescription}"
    - Целевая аудитория сценария: "${scenarioTargetAudience}"
    - Название раздела: "${chapterName}"
    - Описание раздела: "${chapterDescription}"
    - Время начала раздела: ${chapterStartTime}
    - Время окончания раздела: ${chapterEndTime}
    - Название сцены: "${sceneName}"
    - Описание сцены: "${sceneDescription}"
    - Время начала сцены: ${sceneStartTime}
    - Время окончания сцены: ${sceneEndTime}

    # Данные:
    - Временная шкала разделов сценария: ${JSON.stringify(scenarioChaptersTimeline ?? [])}
    - Временная шкала сцен раздела: ${JSON.stringify(chapterScenesTimeline ?? [])}
    - Позиция текущей сцены в разделе: ${JSON.stringify(scenePositionInChapter ?? null)}
    - Уже сгенерированные компоненты из предыдущих сцен: ${JSON.stringify(alreadyGeneratedComponentsFromPreviousScenes ?? [])}
    - Доступные типы компонентов сцены: ${JSON.stringify(availableSceneComponentTypes)}

    # Правила:
    - У каждого компонента должно быть уникальное название
    - Возвращай только компоненты из списка доступных типов компонентов сцены
    - Если компонент сцены опциональный, его можно опустит
    - Поле "content" компонента должно содержать полезный Markdown-текст (абзацы, маркированные списки, выделение где уместно), а не простую однострочную фразу
  `;
}
