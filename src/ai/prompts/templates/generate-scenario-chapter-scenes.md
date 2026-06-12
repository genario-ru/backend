Break EVERY chapter listed in the "Chapters" section into scenes and generate each scene's components (voice-over, visuals, etc.) — all chapters in this single response. The result must read as one continuous video script, not as isolated fragments.

## Coverage rules (critical)

- The output must contain exactly {{CHAPTER_COUNT}} chapter entries, with chapterIndex values exactly: {{CHAPTER_INDEXES}}.
- One entry per listed chapter — no skipped, merged, split, or invented chapters; each index appears exactly once.
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
- **name**: the component type's name copied exactly as listed (e.g. "Голосовое сопровождение") — never paraphrase or translate it.
- **typeId**: copied character-for-character from the same entry of the "Component types" section as the name. The values listed there are the ONLY valid typeId values in your entire output. NEVER write a typeId from memory, never compose, alter, shorten, or "fix" one — always re-read it from the list, even though the same ids repeat in every scene.
- **content**: 1–4096 characters. Natural speech for spoken components; Markdown is allowed for utility/technical components.
- **Timing**: spoken/on-screen text must fit the scene duration. {{WORD_BUDGET_HINTS}}

## Narrative quality (the script is judged as a whole)

- **Single arc**: the scenario is one story. The very first scene of chapter 1 opens with a strong hook; every later scene continues the previous scene's last thought — across chapter boundaries too. No re-greetings, no re-introductions, no "in this chapter" meta-phrases.
- **Transitions**: the last scene of each chapter should hand off naturally into the first scene of the next chapter (open loop, question, or contrast).
- **Variety of expression**: every voice-over in the scenario must open with a different word and a different rhetorical device. Before finalizing, scan all voice-overs you have written across ALL chapters — never reuse an opening pattern (e.g. "Забудьте", "Представьте", "Вспомните", "Многие думают"). Vary sentence length and rhythm between scenes.
- **Specificity**: concrete details, numbers, and imagery over generic filler; every scene must add new information or emotion, never restate a previous scene.

## Component types

The pairs below are the single source of truth for component name and typeId. A component's typeId must always be the one printed directly under its name.

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
{ name: "Цель и задачи сцены", content: "Создать момент узнавания...", typeId: "<copied character-for-character from the Component types list>" },
{ name: "Голосовое сопровождение", content: "Первые две недели — кайф. Мышцы болят, весы падают. Только этот минус два — не жир. Это вода.", typeId: "<copied from the list>" },
{ name: "Визуальное сопровождение", content: "Крупный план автора, затем врезка весов.", typeId: "<copied from the list>" }
]

Scene 2: name "Момент X: весы останавливаются", startTime 15, endTime 21
components: [ ... ]

Scene 3: name "Психология отказа", startTime 21, endTime 28
components: [ ... ]

## Final self-check before answering

1. The output has exactly {{CHAPTER_COUNT}} chapter entries with chapterIndex values {{CHAPTER_INDEXES}} — count them.
2. Each chapter's scenes exactly tile its time range (first = chapter start, last = chapter end, contiguous in between).
3. Every scene contains all [required] components, each name copied exactly from the "Component types" list.
4. Every typeId in the output is found verbatim in the "Component types" section and is paired with its own name — re-check each one character-for-character; a single wrong typeId invalidates the whole answer.
5. Each voice-over fits its scene's word budget and opens differently from all others.
