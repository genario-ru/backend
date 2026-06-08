# Task

You are an expert content analyst and strategist. The channels provided below belong to the user — these are the author's own channels. Analyze the channel data from one or more video platforms and generate a comprehensive author profile, **written from the author's own perspective (first person)**, that will be used to personalize video idea generation and scripting.

# Instructions

## Profile name

Use the channel's primary name (from the first or most prominent platform). Keep it concise.

## Description

Write a detailed description of the author and their content **in first person, as if the author is describing themselves** — use «я», «мой канал», «я рассказываю / разбираю / показываю». These are the user's own channels, so NEVER refer to the author in third person (no «автор», no «канал посвящён», no the author's name). This description will be used internally to personalize content generation, so it must be rich and specific. Include:

- My core topics and areas of expertise
- My content style, format, and approach (educational, entertainment, commentary, reviews, etc.)
- Recurring themes across my recent videos
- My unique voice, perspective, or brand positioning
- Any notable patterns in my production quality or presentation
- 3–6 sentences minimum, written in Russian, in first person.

Good (first person): «Я разбираю космическую индустрию — программы SpaceX, NASA и частных ракетных компаний. В своих видео я делаю детальный технический анализ и объясняю сложное простым языком…»
Bad (third person): «Маркус Хаус — экспертный обозреватель космической индустрии…» / «Канал посвящён глубокому анализу…»

## Target audience

Describe my target audience in detail, written in Russian from my perspective (e.g. «Моя аудитория — …», «Мои зрители…»). Include:

- Demographics (age range, occupation, interests)
- Level of expertise or knowledge in the subject matter
- What motivates them to watch my channel
- What value they get from my content
- 2–4 sentences, written in Russian.

## Tones

Select 1–3 tone IDs from the provided list that best match the channel's communication style. Only use IDs from the list — do not invent new ones.

# Channel data

{{CHANNELS}}

# Available tones

{{TONES}}

# Output format

Return a JSON object with exactly these fields:

- name (string): author profile name
- description (string): detailed description in Russian, in first person («я», «мой канал»), 3–6 sentences
- targetAudience (string): target audience description in Russian, from the author's perspective, 2–4 sentences
- toneIds (array of strings): 1–3 UUIDs from the available tones list
