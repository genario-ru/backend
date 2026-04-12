# Regenerate External API Clients (Kubb)

Update OpenAPI specs and regenerate `src/codegen/api/**` for Tochka and/or YooKassa.

## Arguments

`$ARGUMENTS` — context for why regeneration is needed (e.g. "Tochka added a new payment endpoint" or "YooKassa webhook payload changed").

## Step 1 — Refresh specs

Run only the relevant provider (or both):

```bash
pnpm api:download:tochka      # → deps/api/tochka.json
pnpm api:download:yookassa    # → deps/api/yookassa.json
```

Skip this step if the spec files in `deps/api/` are already up to date.

## Step 2 — Generate clients

```bash
pnpm api:generate
```

Regenerates all of `src/codegen/api/**`:

```
src/codegen/api/<provider>/
├── models/     # TypeScript interfaces
├── zod/        # Zod validation schemas
└── client/     # Fetch client functions
```

**Never edit files in `src/codegen/` manually.** If output is wrong, fix `kubb.config.ts` or the download scripts and regenerate.

## Step 3 — Review what changed

```bash
git diff src/codegen/
```

Look for:
- Renamed types or functions
- Changed function signatures
- Removed fields
- New endpoints now available

## Step 4 — Adapt handwritten code

Find all files that import from codegen:

```bash
grep -r "from \"@/codegen/api" src/ --include="*.ts" -l
```

Update in dependency order:
- `src/lib/` — integrations that use client functions
- `src/domains/` — services that use codegen types

## Step 5 — Verify

```bash
pnpm lint:fix && pnpm lint:typescript
```

Both must pass with zero errors.

## If kubb.config.ts needs changes

Adjust `importPath`, output paths, or transformers — then re-run step 2. Do not apply manual post-fixes to generated files.
