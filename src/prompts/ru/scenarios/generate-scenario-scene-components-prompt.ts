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
    - Считай текущую сцену частью единого непрерывного видео-повествования: переходы между сценами должны ощущаться естественно
    - Каждый компонент сцены — представление этой сцены в конкретном формате
    - Компоненты, где есть текст для озвучки/показа зрителю (дикторский текст, озвучка, субтитры), должны быть полностью готовы к использованию без дописывания
    - Компоненты с озвучкой/субтитрами должны опираться на уже сгенерированные предыдущие сцены, чтобы сохранять нить повествования, стиль и ритм

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
    - Если компонент сцены опциональный, его можно опустить
    - Для компонентов с текстом, который будет звучать или показываться зрителю (озвучка / субтитры / речь ведущего), пиши живой связный текст в 1-3 абзаца, а не списки, не шаблоны и не заголовки
    - Для компонентов с озвучкой/субтитрами запрещено заново начинать общение с приветствий или повторных интро-фраз ("привет", "добро пожаловать" и т.п.), если это не первая сцена раздела
    - Для компонентов с озвучкой/субтитрами первая фраза должна плавно продолжать мысль предыдущей сцены, если есть контекст прошлых сцен
    - Не повторяй один и тот же синтаксический шаблон между соседними сценами: варьируй начало фраз, ритм, длину предложений и связки
    - Не пересказывай заново уже сказанное в предыдущих сценах без нового смысла (новый ракурс, контраст, последствие, пример)
    - Держи формулировки конкретными и естественными для целевой аудитории, без канцеляризмов и пустых фраз
    - Для служебных неозвучиваемых компонентов (например, цели сцены, чек-листы, заметки продакшена) допускается Markdown-структура
  `;
}
