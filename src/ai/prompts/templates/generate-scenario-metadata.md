## Task

Generate publishing metadata (title, body, tags) for the scenario below, tailored separately for each target platform. The scenario describes a future video — your output is what the creator will paste into each platform when uploading the video.

For every platform listed in `## Platforms` you MUST return exactly one item in the response array. Use the platform's `id` verbatim as `platformId` so the items can be matched. Tailor the wording, length, and tone of `title`, `body`, and `tags` to that platform's audience and constraints described in its `metadataDetails`.

## Field requirements

title:

- A scroll-stopping headline that fits the platform's typical title length and conventions.
- Speak the platform's native voice (e.g. punchy and emoji-friendly for short-form, more descriptive for long-form).
- Avoid clickbait that misrepresents the scenario.

body:

- The post text / video description shown under or alongside the video.
- Hook in the first sentence, then expand on what the viewer will get.
- Length and structure should match what the platform expects — see `metadataDetails`.
- Plain text. Do NOT include the hashtags here — they belong in `tags`.

tags:

- A single string of hashtags separated by commas, e.g. `#fitness, #motivation, #gym`.
- Each tag starts with `#`, no spaces inside a tag, lowercase preferred unless the platform expects otherwise.
- Choose tags that are relevant to the scenario and known to perform on that platform.
- If the platform has a typical tag count from `metadataDetails`, respect it; otherwise pick 5–10.

## Scenario context

{{CONTEXT}}

## Platforms

{{PLATFORMS}}

## Example

Illustrative only — adapt to the actual scenario and use each platform's real `id` as `platformId`. Two platforms with different voices (long-form descriptive vs short-form punchy):

```json
{
  "items": [
    {
      "platformId": "<platform-id-1>",
      "title": "Почему 90% новичков бросают спортзал — и как не бросить",
      "body": "Разбираю настоящие причины, по которым тренировки забрасывают в первый месяц, и простую систему, которая помогает не сорваться. В видео: три ошибки новичков, одна привычка вместо изнурительных тренировок и план на первую неделю.",
      "tags": "#фитнес, #спортзал, #мотивация, #тренировки, #зож"
    },
    {
      "platformId": "<platform-id-2>",
      "title": "90% бросают зал за месяц 😅 а ты?",
      "body": "Лови систему, чтобы не слиться 💪 Сохрани, чтобы не потерять!",
      "tags": "#фитнес, #зож, #мотивация, #спортзал, #тренировки"
    }
  ]
}
```

## Output

Return a JSON object `{ "items": [...] }` with one entry per platform listed above. Do not invent platforms. Do not omit platforms.
