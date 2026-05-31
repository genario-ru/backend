# Update AI Prompt

Change backend prompt templates safely.

## Arguments

`$ARGUMENTS` - prompt name and intended behavior change.

## Workflow

1. Inspect the prompt triplet:
   - `src/ai/prompts/templates/<name>.md`
   - `src/ai/prompts/types/<name>.ts`
   - `src/ai/prompts/builders/<name>.ts`
2. Inspect 2-3 similar prompt triplets for interpolation and optional-context patterns.
3. Update template placeholders.
4. Update props types for every placeholder.
5. Update builder variables and `interpolate(...)` call.
6. Use `buildContextLines(...)` for optional context blocks when local precedent does so.
7. Search and update call sites.
8. Preserve UTF-8 Russian text; do not introduce mojibake.
9. Run `pnpm lint:typescript` when TypeScript files changed.

## Finish Checklist

- Template placeholders, builder variables, and props type match exactly.
- Optional blocks render clean Markdown.
- Prompt semantics changed only as requested.
- Call sites compile.
