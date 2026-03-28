Break chapter "{{CHAPTER_NAME}}" into {{SCENE_COUNT}} scenes that fill {{TIME_RANGE}}. For each scene, also generate its components (voice-over, visuals, etc.) in one pass.

## Part 1 — Scenes

Each scene: name, startTime, endTime.

- Scenes must be contiguous (scene N endTime = scene N+1 startTime).
- First scene starts at {{CHAPTER_START}}, last ends at {{CHAPTER_END}}.
- Maintain narrative continuity with previous chapters.

## Part 2 — Components (per scene)

For each scene, generate components from the types below. Use the type's name exactly (e.g. "Голосовое сопровождение").

- **Timing**: spoken/on-screen text must fit the scene duration. {{WORD_BUDGET_HINTS}}
- **Continuity**: first scene in chapter — open with a hook. Later scenes — continue from the previous scene's last thought, no re-greeting.
- **Required components**: include all. Optional: only when they enrich the scene.
- Omit a component if you cannot produce meaningful content.

## Component types

{{COMPONENT_TYPES}}

## Output structure

For each scene: { name, startTime, endTime, components: [{ name, content, typeId }] }

- name: use component type name exactly.
- content: natural speech within word budget; Markdown for utility components.
- typeId: exact id from the list above.

## Context

{{CONTEXT}}

## Previous chapters (scenes + components for continuity)

{{PREVIOUS_CHAPTERS}}

## Example

Chapter "Проблема: три причины" (7s–28s), 3 scenes:

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
