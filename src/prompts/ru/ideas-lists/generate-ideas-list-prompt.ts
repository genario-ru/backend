type GenerateIdeasListPromptProps = {
  userPrompt?: string | null;
  context: {
    name?: string | null;
    description?: string | null;
    targetAudience?: string | null;
    templateName?: string | null;
    templateDescription?: string | null;
    profileName?: string | null;
    profileDescription?: string | null;
    tones?: string[];
    videoTypes?: {
      id: string;
      name: string;
    }[];
  };
  settings: {
    ideasCount: number;
  };
};

export function generateIdeasListPrompt({
  userPrompt,
  settings,
  context,
}: GenerateIdeasListPromptProps) {
  const {
    name,
    description,
    targetAudience,
    templateName,
    templateDescription,
    profileName,
    profileDescription,
    tones,
    videoTypes,
  } = context;

  const { ideasCount } = settings;

  const prompt = `
    # Инструкции:
    - Сгенерируй ${ideasCount} идей для видео на основе предоставленного контекста и данных

    # Контекст:
    - Пользовательский запрос к списку идей: "${userPrompt}"
    - Название списка идей: "${name}"
    - Описание списка идей: "${description}"
    - Целевая аудитория списка идей: "${targetAudience}"
    - Название шаблона списка идей: "${templateName}"
    - Описание шаблона списка идей: "${templateDescription}"
    - Название профиля списка идей: "${profileName}"
    - Описание профиля списка идей: "${profileDescription}"
    - Тональности списка идей: ${tones?.join(", ")}
    - Типы видео списка идей: ${videoTypes?.map((videoType) => videoType.name).join("\n")}

    # Данные:
    - Доступные типы видео: ${JSON.stringify(videoTypes)}

    # Правила:
    - У каждой идеи должен быть уникальный угол подачи
    - Название должно быть коротким (макс. 80 символов)
    - Описание должно раскрывать основной хук и быть подробным
    - Выбирай самый подходящий тип видео для каждой идеи

    # Ограничения:
    - Не придумывай новые тональности или типы видео
    - Не используй один и тот же тип видео для всех идей
  `;

  return prompt;
}
