---
name: update-ai-prompt
description: Updates backend AI prompt templates together with their typed props and builders. Use when editing src/ai/prompts.
---

# Update AI Prompt

## When To Use

Use this when changing prompt templates, prompt variables, prompt builder output, or typed prompt props under `src/ai/prompts/**`.

## Steps

1. Inspect the existing prompt triplet:
   - `src/ai/prompts/templates/<name>.md`
   - `src/ai/prompts/types/<name>.ts`
   - `src/ai/prompts/builders/<name>.ts`
2. Find at least 2-3 nearby prompt triplets and copy their interpolation/context style.
3. Update the Markdown template and keep placeholders explicit and named.
4. Update the TypeScript props type so every placeholder has a typed source.
5. Update the builder:
   - use `interpolate(...)`;
   - use `buildContextLines(...)` for optional context blocks when local precedent does so;
   - avoid constructing large prompt strings inline in services.
6. Search for the prompt builder usage and update call sites.
7. If editing Russian examples or messages, preserve UTF-8 text and do not introduce mojibake.
8. Run `pnpm lint:typescript` when TypeScript files changed.

## Self-check

- Template placeholders match builder variables exactly.
- Optional blocks do not leave dangling empty labels or malformed Markdown.
- Prompt changes are scoped to the requested behavior.
- Existing generated/user-facing text semantics were not silently rewritten.
