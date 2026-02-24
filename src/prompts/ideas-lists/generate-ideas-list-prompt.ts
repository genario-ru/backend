type GenerateIdeasListPromptProps = {
  userPrompt?: string | null;
  ideasCount?: number | null;
  ideasListName?: string | null;
  ideasListDescription?: string | null;
  ideasListTargetAudience?: string | null;
  ideasListTemplateName?: string | null;
  ideasListTemplateDescription?: string | null;
  ideasListProfileName?: string | null;
  ideasListProfileDescription?: string | null;
  ideasListTones?: string[] | null;
  ideasListVideoTypes?: {
    id: string;
    name: string;
  }[];
  previousGeneratedIdeas?: {
    name: string | null;
    description: string | null;
    videoType: {
      id: string;
      name: string;
    };
  }[];
};

export function generateIdeasListPrompt({
  userPrompt,
  ideasCount,
  ideasListName,
  ideasListDescription,
  ideasListTargetAudience,
  ideasListTemplateName,
  ideasListTemplateDescription,
  ideasListProfileName,
  ideasListProfileDescription,
  ideasListTones,
  ideasListVideoTypes,
  previousGeneratedIdeas,
}: GenerateIdeasListPromptProps) {
  const prompt = `
    # Instructions:
    - Generate exactly ${ideasCount} top-tier video ideas: highly creative, with compelling hooks that drive engagement (e.g., emotional pull, surprise twist, urgency).
    - Adapt to audience (e.g., age/interests), platforms (e.g., viral hooks for TikTok, SEO for YouTube), tones, and profile for personalization.
    - If template provided: strictly anchor to its description as core theme/direction, but infuse with unique creative spins.
    - Maximize diversity: varied angles/themes (e.g., mix educational/entertaining), balanced video types (at least 50% mix if multiple available), tone distribution.
    - Ensure zero semantic overlap with previous ideas: different topics, structures, keywords (e.g., if previous include 'beaches/kitchen/waterfalls/sunsets', avoid nature/culinary themes or pivot drastically).
    
    # Context:
    - User prompt: "${userPrompt || ""}";
    - Ideas list name: "${ideasListName || ""}";
    - Ideas list description: "${ideasListDescription || ""}";
    - Target audience: "${ideasListTargetAudience || ""}";
    - Template name: "${ideasListTemplateName || ""}";
    - Template description: "${ideasListTemplateDescription || ""}";
    - Profile name: "${ideasListProfileName || ""}";
    - Profile description: "${ideasListProfileDescription || ""}";
    - Tones: ${ideasListTones?.join(", ") || "neutral"};
    - Video types: ${ideasListVideoTypes?.map((vt) => vt.name).join(", ") || "short, long"};
    
    # Data:
    - Available video types (use ids only): ${JSON.stringify(ideasListVideoTypes || [])};
    - Previous generated ideas (avoid all similarities): ${JSON.stringify(previousGeneratedIdeas || [])};
    
    # Rules:
    - Output language: natural, conversational Russian — engaging, creator-optimized (e.g., vivid, non-clichéd phrasing with scripting/visual tips).
    - Name: concise (max 80 chars), hook-centric (e.g., "Шокирующие секреты Бали, которые изменят твой отпуск").
    - Description: comprehensive & detailed (300-600 chars) to fully reveal the idea: start with core hook, outline video structure (key segments/scenes), include practical elements (e.g., visuals, dialogue ideas, transitions), explain audience engagement/value, end with performance rationale (e.g., "why it'll boost views/subs on [platform]").
    - videoTypeId: select most fitting id; enforce diversity (not all short/long).
    
    # Constraints:
    - No new tones/types/ids;
    - No thematic/keyword repeats from previous (strict semantic check);
  `;
  return prompt;
}

export function generateIdeasListPromptV2({
  userPrompt,
  ideasCount,
  ideasListName,
  ideasListDescription,
  ideasListTargetAudience,
  ideasListTemplateName,
  ideasListTemplateDescription,
  ideasListProfileName,
  ideasListProfileDescription,
  ideasListTones,
  ideasListVideoTypes,
  previousGeneratedIdeas,
}: GenerateIdeasListPromptProps) {
  return `
    Generate EXACTLY ${ideasCount} high-quality, strategically differentiated video ideas based on rules, context and data provided below.

    # Rules
    - Video ideas names must be concise (max 80 chars), hook-centric (e.g., "Шокирующие секреты Бали, которые изменят твой отпуск");
    - Video ideas descriptions must be comprehensive & detailed (300-600 chars) to fully reveal the idea: start with core hook, outline video structure (key segments/scenes), explain audience engagement/value, end with performance rationale (e.g., "why it'll boost views/subs on [platform]");
    - Video ideas reasons must be concise (max 200 chars) to fully reveal the reason why the idea will be successful;
    - Video ideas must be highly creative, with compelling hooks that drive engagement (e.g., emotional pull, surprise twist, urgency);
    - Video ideas should be tailored to the template, user prompt, video type, profile, target audience and tones described in "Context" section;
    - Video ideas should strictly anchor to the template description as core theme/direction if template is provided, but infuse with unique creative spins;
    - Video ideas should be equally balanced in video types (at least 50% mix if multiple available);

    # Context:
    - User prompt: "${userPrompt}";
    - Ideas list name: "${ideasListName}";
    - Ideas list description: "${ideasListDescription}";
    - Target audience: "${ideasListTargetAudience}";
    - Template name: "${ideasListTemplateName}";
    - Template description: "${ideasListTemplateDescription}";
    - Profile name: "${ideasListProfileName}";
    - Profile description: "${ideasListProfileDescription}";
    - Tones: ${ideasListTones?.join(", ")};
    - Video types: ${ideasListVideoTypes?.map((vt) => vt.name).join(", ")};
    
    # Data:
    - Available video types: ${JSON.stringify(ideasListVideoTypes ?? [])};
    - Previous generated ideas: ${JSON.stringify(previousGeneratedIdeas ?? [])};

    # Examples:

    Example 1:
    - Name: Мотивация не работает — и это нормально;
    - Description: Видео объясняет, почему мотивация нестабильна и не может быть опорой для системных изменений. Автор показывает различие между эмоциональным импульсом и выстроенной средой, которая поддерживает действие. Делается акцент на системном подходе вместо ожидания вдохновения;
    - Reason: Разрушение популярного мифа вызывает интерес и дискуссию. Тема дисциплины и самоконтроля стабильно востребована широкой аудиторией.

    Example 2:
    - Name: Большинство стартапов не должны были начинаться;
    - Description: Видео показывает, что проблема многих проектов кроется в изначальной гипотезе, а не в плохом исполнении. Автор разбирает, как предприниматели влюбляются в идею без проверки реального спроса. Основной акцент — на важности тестирования рынка до масштабирования;
    - Reason: Провокационная позиция вызывает сильную реакцию и обсуждение. Предпринимательская аудитория активно вовлекается в подобные дискуссии.

    Example 3:
    - Name: Вы не худеете не потому, что мало стараетесь;
    - Description: Видео объясняет, что отсутствие прогресса чаще связано с неправильной стратегией питания и восстановления, а не с недостатком усилий. Автор показывает типичный цикл “строгая диета — срыв — чувство вины” и объясняет, почему он повторяется. В центре внимания — смена системы, а не увеличение нагрузки;
    - Reason: Снятие чувства вины и объяснение механики создают доверие. Люди активно реагируют на контент, который помогает им иначе взглянуть на свои неудачи.
  `;
}
