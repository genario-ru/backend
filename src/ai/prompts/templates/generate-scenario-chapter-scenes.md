Break EVERY chapter listed in the "Chapters" section into scenes and generate each scene's components (voice-over, visuals, etc.) — all chapters in this single response. The result must read as one continuous video script, not as isolated fragments.

## Coverage rules (critical)

- Return exactly one entry per listed chapter — no skipped, merged, split, or invented chapters.
- chapterIndex must be the exact index from the "Chapters" section; each index appears exactly once.
- Order chapter entries by chapterIndex ascending.

## Part 1 — Scenes

Each scene: name, startTime, endTime.

- name: a short, specific scene title (3–100 characters) that reflects the scene's dramatic purpose.
- startTime / endTime: integers, seconds on the overall video timeline; endTime > startTime.
- Scenes of a chapter must exactly tile that chapter's time range: the first scene starts at the chapter's startTime, the last scene ends at the chapter's endTime, and scene N's endTime equals scene N+1's startTime. No gaps, no overlaps, no scenes outside the chapter's range.
- Chapter boundaries are fixed input data — never change them.
- Follow the recommended scene count given for each chapter; prefer the higher end of the range for richer storytelling.

## Part 2 — Components (per scene)

For each scene, generate components from the "Component types" section.

- **Required components**: include every [required] type in every scene. Include [optional] types only when they genuinely enrich the scene; omit a component entirely if you cannot produce meaningful content for it.
- **name**: the component type's name copied exactly (e.g. "Голосовое сопровождение").
- **typeId**: the exact id of that type from the list — never invent or alter ids.
- **content**: 1–4096 characters. Natural speech for spoken components; Markdown is allowed for utility/technical components.
- **Timing**: spoken/on-screen text must fit the scene duration. {{WORD_BUDGET_HINTS}}

## Narrative quality (the script is judged as a whole)

- **Single arc**: the scenario is one story. The very first scene of chapter 1 opens with a strong hook; every later scene continues the previous scene's last thought — across chapter boundaries too. No re-greetings, no re-introductions, no "in this chapter" meta-phrases.
- **Transitions**: the last scene of each chapter should hand off naturally into the first scene of the next chapter (open loop, question, or contrast).
- **Variety of expression**: every voice-over in the scenario must open with a different word and a different rhetorical device. Before finalizing, scan all voice-overs you have written across ALL chapters — never reuse an opening pattern (e.g. "Забудьте", "Представьте", "Вспомните", "Многие думают"). Vary sentence length and rhythm between scenes.
- **Specificity**: concrete details, numbers, and imagery over generic filler; every scene must add new information or emotion, never restate a previous scene.

## Component types

{{COMPONENT_TYPES}}

## Context

{{CONTEXT}}

## Chapters

{{CHAPTERS}}

## Output structure

{ chapters: [{ chapterIndex, scenes: [{ name, startTime, endTime, components: [{ name, content, typeId }] }] }] }

## Example (shape only — follow the chapter list above for real indexes and timings)

Chapter 2. "Проблема: три причины" (7s–28s), recommended 3 scenes:

chapterIndex: 2, scenes:

Scene 1: name "Иллюзия прогресса", startTime 7, endTime 15
components: [
{ name: "Цель и задачи сцены", content: "Создать момент узнавания...", typeId: "..." },
{ name: "Голосовое сопровождение", content: "Первые две недели — кайф. Мышцы болят, весы падают. Только этот минус два — не жир. Это вода.", typeId: "..." },
{ name: "Визуальное сопровождение", content: "Крупный план автора, затем врезка весов.", typeId: "..." }
]

Scene 2: name "Момент X: весы останавливаются", startTime 15, endTime 21
components: [ ... ]

Scene 3: name "Психология отказа", startTime 21, endTime 28
components: [ ... ]

## Final self-check before answering

1. Every listed chapter is present exactly once with its exact index.
2. Each chapter's scenes exactly tile its time range (first = chapter start, last = chapter end, contiguous in between).
3. Every scene contains all [required] components with exact names and typeIds.
4. Each voice-over fits its scene's word budget and opens differently from all others.
