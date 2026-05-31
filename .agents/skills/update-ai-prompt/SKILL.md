---
name: update-ai-prompt
description: Use when changing backend AI prompt templates, prompt variables, prompt builders, or prompt prop types.
---

# Update AI Prompt

Prompt work usually has a synchronized triplet:

- `src/ai/prompts/templates/<name>.md`
- `src/ai/prompts/types/<name>.ts`
- `src/ai/prompts/builders/<name>.ts`

Workflow:

1. Inspect the triplet for the prompt being changed.
2. Inspect 2-3 nearby prompt triplets to follow interpolation and optional-context style.
3. Update template placeholders and keep them explicit.
4. Update the props type so every placeholder has a typed source.
5. Update the builder using `interpolate(...)`; use `buildContextLines(...)` for optional context blocks when local precedent does so.
6. Search prompt builder call sites and update arguments.
7. Preserve UTF-8 Russian text; do not introduce mojibake while editing examples or messages.
8. Run `pnpm lint:typescript` when TypeScript files changed.

Finish by checking that placeholders, builder variables, and call-site props match exactly.
