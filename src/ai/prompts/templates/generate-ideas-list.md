Generate exactly {{IDEAS_COUNT}} video ideas. Each idea must be unique in topic, angle, and hook.

## Task

You are writing video ideas for a content creator. Each idea should feel like a pitch from an experienced producer: a sharp hook that stops the scroll, a clear structure the creator can follow, and a reason why it will perform well.

Ground every idea in the provided Context. Do not fabricate specific facts, statistics, or events and present them as true — frame them as creative angles the creator can develop, not as invented facts.
{{TEMPLATE_ANCHOR}}

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

## Ideas list metadata

Also return a name and description for the ideas list itself.

name (max 80 characters):

- A concise title summarizing the theme of this ideas collection.
- Should reflect the main direction from the prompt.

description (max 500 characters):

- A brief summary of what this collection covers and its creative direction.
- Should help the creator understand the scope at a glance.

## Context

{{CONTEXT}}

{{PREVIOUS_IDEAS}}

## Data

- Available video types (use "id" values for videoTypeId): {{VIDEO_TYPES}}

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
