# Add Environment Variable

Add a new environment variable across all required backend layers.

## Arguments

`$ARGUMENTS` — name and description of the variable (e.g. "STRIPE_SECRET_KEY for Stripe payment integration").

## All 4 update points are mandatory

### 1. `src/schemas/common/envs.ts` — Zod validation schema

```typescript
export const envsSchema = z.object({
  // ... existing vars ...
  MY_VAR: z.string().min(1),
});
```

### 2. `src/constants/common/envs.ts` — runtime mapping

```typescript
const parsed = envsSchema.parse(process.env);

export const envs = {
  // ... existing vars ...
  myVar: parsed.MY_VAR,
};
```

### 3. `docker-compose.yml` — both `server` AND `workers` services

```yaml
services:
  server:
    environment:
      MY_VAR: ${MY_VAR}

  workers:
    environment:
      MY_VAR: ${MY_VAR}
```

### 4. `.env.example` — documentation for other developers

```bash
# Description of what this variable is for
MY_VAR=example_value
```

## Steps

1. Add the variable to all 4 locations above.
2. Add the actual value to your local `.env`.
3. Restart the dev server to verify startup Zod validation passes:
   ```bash
   pnpm dev
   ```
4. Run type check:
   ```bash
   pnpm lint:typescript
   ```

## Finish checklist

- [ ] Variable in `src/schemas/common/envs.ts` (Zod schema)
- [ ] Variable mapped in `src/constants/common/envs.ts`
- [ ] Both `server` and `workers` in `docker-compose.yml` have the variable
- [ ] `.env.example` updated with an example value and comment
- [ ] Local `.env` has the real value
- [ ] Server starts without Zod validation errors
