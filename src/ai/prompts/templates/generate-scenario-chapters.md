{{TIMELINE_INSTRUCTION}}

## Task

Structure the video as a series of narrative chapters. Each chapter is one self-contained story beat — hook, problem setup, insight, resolution, call-to-action, etc. Together they must create a smooth arc that keeps the viewer engaged from start to finish.

Adapt pacing to the target platforms in Context: for short-form / vertical platforms (Shorts, Reels, Клипы, TikTok) front-load a strong hook in the first 1–3 seconds and keep relentless momentum; for long-form platforms you can develop the setup more gradually.

## Field requirements

name (max 100 characters):

- A concise label for what this chapter accomplishes in the story.
- Good: "Крючок: вопрос, который останавливает скролл"
- Good: "Проблема: почему стандартные диеты не работают"
- Bad: "Глава 1" / "Введение" / "Основная часть"

description (100–400 characters):

- 2–3 sentences: key message, visual approach, and emotional beat.
- Write as a creative brief for a video editor — not a table of contents.

startTime / endTime (integers, seconds):

- {{END_TIME_RULE}}
- Chapters must be contiguous — chapter N's endTime equals chapter N+1's startTime.
- Distribute time proportionally: hook and closing are typically shorter than the core content sections.

## Context

{{CONTEXT}}

## Example

Scenario: "Почему 90% людей бросают спортзал" — мотивационное видео для аудитории 20–35 лет, 60 секунд

Chapter 1:

- name: "Крючок: вопрос, который останавливает скролл"
- description: "Автор с места в карьер задаёт провокационный вопрос в камеру. Крупный план, контрастный фон, никаких вступлений. Цель — остановить скролл и создать ощущение, что это видео именно про тебя."
- startTime: 0
- endTime: 7

Chapter 2:

- name: "Проблема: три причины, которые никто не называет"
- description: "Быстрый разбор скрытых причин провала — не лень, а психология первых недель. Динамичный монтаж с текстовыми вставками. Зритель узнаёт себя и хочет услышать решение."
- startTime: 7
- endTime: 28

Chapter 3:

- name: "Решение: одна привычка вместо трёх часов в зале"
- description: "Автор раскрывает неочевидный принцип, который меняет отношение к тренировкам. Темп замедляется, акцент на конкретике. Смена локации визуально сигнализирует переход к сути."
- startTime: 28
- endTime: 50

Chapter 4:

- name: "Финал: что делать прямо сейчас"
- description: "Короткое резюме и конкретный следующий шаг для зрителя. Энергичная интонация, текстовый оверлей с CTA. Конец без затухания — резкий и запоминающийся."
- startTime: 50
- endTime: 60
