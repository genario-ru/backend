import { buildContextLines } from "@/prompts/utils/build-context-lines";

type VideoType = { id: string; name: string };

type PreviousIdea = {
  name: string | null;
  description: string | null;
  videoType: VideoType;
};

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
  ideasListVideoTypes?: VideoType[];
  previousGeneratedIdeas?: PreviousIdea[];
};

function buildPreviousIdeasBlock(ideas?: PreviousIdea[] | null): string {
  if (!ideas || ideas.length === 0) return "";
  const list = ideas
    .map(
      (idea, i) =>
        `${i + 1}. "${idea.name}" — ${idea.description ?? "no description"} [${idea.videoType.name}]`,
    )
    .join("\n");
  return `\n## Previously generated ideas (blacklist — produce entirely different topics, angles, and keywords)\n${list}`;
}

function buildTemplateAnchor(templateName?: string | null): string {
  if (!templateName) return "";
  return `\nThe template "${templateName}" defines the core theme — anchor every idea to it, but give each one a distinct creative spin.\n`;
}

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
  const contextLines = buildContextLines([
    ["User prompt", userPrompt],
    ["Ideas list name", ideasListName],
    ["Ideas list description", ideasListDescription],
    ["Target audience", ideasListTargetAudience],
    ["Template name", ideasListTemplateName],
    ["Template description", ideasListTemplateDescription],
    ["Profile name", ideasListProfileName],
    ["Profile description", ideasListProfileDescription],
    ["Tones", ideasListTones?.join(", ")],
    ["Video types", ideasListVideoTypes?.map((vt) => vt.name).join(", ")],
  ]);

  return `
    Generate exactly ${ideasCount} video ideas. Each idea must be unique in topic, angle, and hook.

    ## Task
    You are writing video ideas for a content creator. Each idea should feel like a pitch from an experienced producer: a sharp hook that stops the scroll, a clear structure the creator can follow, and a reason why it will perform well.
    ${buildTemplateAnchor(ideasListTemplateName)}
    ## Field requirements

    name (max 80 characters):
    - A hook-driven title that creates curiosity, tension, or surprise.
    - Pattern: provocation, counterintuitive claim, or specific promise.
    - Good: "Шокирующие секреты Бали, которые изменят твой отпуск"
    - Good: "Почему 90% новичков бросают спортзал за месяц"
    - Bad: "Интересное видео про путешествия" / "Советы для начинающих"

    description (200–500 characters):
    - Sentence 1: core hook — what makes this idea compelling.
    - Sentence 2–3: video structure — what segments/scenes the video contains.
    - Sentence 4: why the audience will watch to the end and engage.
    - Write in natural, conversational prose — not bullet points, not templates.

    reason (max 200 characters):
    - One concise statement explaining why this idea will drive views and engagement.

    videoTypeId:
    - Pick from the available video types listed in Data.
    - Distribute evenly across types when multiple are available (aim for ≥40% of each type).

    ## Context
    ${contextLines}

    ## Data
    - Available video types (use "id" values for videoTypeId): ${JSON.stringify(ideasListVideoTypes ?? [])}
    ${buildPreviousIdeasBlock(previousGeneratedIdeas)}

    ## Examples

    Input context: profile "Бизнес и саморазвитие", target audience "предприниматели 25–40", tones "вовлекающий, экспертный"

    Example 1:
    - name: "Мотивация не работает — и это нормально"
    - description: "Видео объясняет, почему мотивация нестабильна и не может быть опорой для системных изменений. Автор показывает различие между эмоциональным импульсом и выстроенной средой, которая поддерживает действие. Делается акцент на системном подходе вместо ожидания вдохновения."
    - reason: "Разрушение популярного мифа вызывает интерес и дискуссию. Тема дисциплины стабильно востребована."

    Example 2:
    - name: "Большинство стартапов не должны были начинаться"
    - description: "Видео показывает, что проблема многих проектов кроется в изначальной гипотезе, а не в плохом исполнении. Автор разбирает, как предприниматели влюбляются в идею без проверки реального спроса. Основной акцент — на важности тестирования рынка до масштабирования."
    - reason: "Провокационная позиция вызывает сильную реакцию. Предпринимательская аудитория активно вовлекается."

    Example 3:
    - name: "Вы не худеете не потому, что мало стараетесь"
    - description: "Видео объясняет, что отсутствие прогресса чаще связано с неправильной стратегией питания, а не с недостатком усилий. Автор показывает типичный цикл строгая диета — срыв — чувство вины и объясняет, почему он повторяется. В центре — смена системы, а не увеличение нагрузки."
    - reason: "Снятие чувства вины создаёт доверие. Люди реагируют на контент, помогающий переосмыслить неудачи."
  `.trim();
}
