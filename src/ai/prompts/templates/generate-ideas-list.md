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

hook (max 200 characters):

- The literal opening line or action for the first 3 seconds of the video — what the creator actually says or shows to stop the scroll.
- Write the real words or visual, ready to use as-is. Do not describe a hook ("start with a question") — write the hook itself.
- Tie it to this idea's specific angle and open an immediate curiosity gap, tension, or bold claim.
- Good: "Я удалил все соцсети на 30 дней. То, что случилось с мозгом, меня напугало."
- Bad: "Начните с интригующего вопроса" / "Зацепите внимание зрителя"

reason (max 200 characters):

- One concise statement explaining why this idea will drive views and engagement.

complexity (integer 0–5):

- Production complexity for a typical solo creator. Assess honestly from the concrete idea and all provided Context — never default to a middle value, never assign at random, and spread scores across the list to reflect real differences between ideas.
- Factors to weigh:
  - video type and duration: a `short` is usually simpler than a `long`, longer videos add complexity;
  - number of distinct scenes, locations, and setups the idea implies;
  - shooting needs: a talking-head or voiceover-over-broll idea is simpler than multi-location filming;
  - editing load: graphics, motion, effects, B-roll, overlays;
  - research depth, data gathering, or fact-checking required;
  - extra dependencies: guests, interviews, props, special equipment.
- Scoring scale:
  - 0 — trivial: one static setup, talking head or voiceover, minimal editing.
  - 1 — very easy.
  - 2 — easy: a couple of scenes, basic editing.
  - 3 — moderate: several scenes/segments, noticeable editing or some research.
  - 4 — hard: many locations/scenes, heavy graphics, or significant research.
  - 5 — very hard: production-intensive — guests, effects, multi-day shoots, deep research.

potential (integer 0–5):

- Expected reach and engagement of this specific idea for THIS creator's audience and niche. Assess honestly from the idea and all provided Context — never default to a middle value, never assign at random, and spread scores to reflect real differences between ideas.
- Factors to weigh:
  - topic demand and searchability for the target audience and profile niche;
  - strength of the hook and emotional or curiosity trigger (controversy, surprise, relatability);
  - fit with the profile, target audience, and tones — a precise niche match scores higher;
  - format fit: whether the angle suits the chosen video type;
  - timeliness and shareability.
- Scoring scale:
  - 0 — almost no interest: overdone or too narrow for this audience.
  - 1 — weak, niche pull.
  - 2 — below average.
  - 3 — solid, steady interest.
  - 4 — high: strong trigger and good audience fit.
  - 5 — viral potential: strong hook + broad demand + precise audience fit.

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
- hook: "Ты не ленивый. Просто тебе никто не сказал, что мотивация — это ловушка."
- reason: "Разрушение популярного мифа вызывает интерес и дискуссию. Тема дисциплины стабильно востребована."
- complexity: 1
- potential: 4

Example 2:

- name: "Большинство стартапов не должны были начинаться"
- description: "Видео показывает, что проблема многих проектов кроется в изначальной гипотезе, а не в плохом исполнении. Автор разбирает, как предприниматели влюбляются в идею без проверки реального спроса. Основной акцент — на важности тестирования рынка до масштабирования."
- hook: "9 из 10 стартапов умирают не из-за денег. Они были обречены ещё до первой строчки кода."
- reason: "Провокационная позиция вызывает сильную реакцию. Предпринимательская аудитория активно вовлекается."
- complexity: 2
- potential: 4

Example 3:

- name: "Вы не худеете не потому, что мало стараетесь"
- description: "Видео объясняет, что отсутствие прогресса чаще связано с неправильной стратегией питания, а не с недостатком усилий. Автор показывает типичный цикл строгая диета — срыв — чувство вины и объясняет, почему он повторяется. В центре — смена системы, а не увеличение нагрузки."
- hook: "Если ты считаешь калории и всё равно не худеешь — проблема не в тебе. И сейчас я докажу."
- reason: "Снятие чувства вины создаёт доверие. Люди реагируют на контент, помогающий переосмыслить неудачи."
- complexity: 1
- potential: 5
