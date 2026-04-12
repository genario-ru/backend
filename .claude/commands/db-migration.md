# Drizzle Migration Workflow

Plan and apply a DB schema change with a proper migration.

## Arguments

`$ARGUMENTS` — description of the schema change (e.g. "add 'slug' column to scenarios" or "create 'referral_code' table").

## Pre-coding step (mandatory)

Before writing any code, read at least **3 similar table definitions** in `src/db/schemas/` to match conventions.

```bash
ls src/db/schemas/
```

List the references before writing code.

## Step 1 — Verify target database

Check `.env` — `POSTGRES_URL` must point to the correct database before running migrations.

## Step 2 — Apply schema changes

Edit files in `src/db/schemas/<group>/<table>.ts`:

```typescript
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const thing = pgTable("thing", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const thingRelations = relations(thing, ({ one }) => ({
  user: one(user, { fields: [thing.userId], references: [user.id] }),
}));
```

**Drizzle conventions**:
- Column names: `camelCase` in code, `snake_case` in DB
- IDs: `uuid("id").primaryKey().defaultRandom()`
- Timestamps: `timestamp("created_at").defaultNow().notNull()`
- Foreign keys: always with `{ onDelete: "cascade" }` unless explicitly otherwise

## Step 3 — Update barrel export

If a new file was created, add to `src/db/schema.ts`:

```typescript
export * from "./schemas/<group>/<table>";
```

## Step 4 — Update entity Zod schema (if needed)

If the table is used in a domain, update `src/domains/<domain>/schemas/entities/<thing>.ts`:

```typescript
import { createSelectSchema } from "drizzle-zod";
import { thing } from "@/db/schema";

export const thingSchema = createSelectSchema(thing).meta({
  title: "Thing",
  description: "Thing description",
  ref: "ThingSchema",
});
```

## Step 5 — Generate and apply migration

```bash
pnpm db:generate    # Generates SQL in src/db/migrations/
```

Review the generated SQL before applying — ensure it matches your intent.

```bash
pnpm db:migrate     # Applies pending migrations
```

## Step 6 — Verify

```bash
pnpm lint:typescript
```

## Step 7 — Commit

Stage and commit schema + migration files together in one commit.

## Common issues

- **`db:push` instead of `db:generate`** — only for local experiments, never for repo workflow
- **Old migration rewrite** — never edit existing migration files; create a new one instead
- **Missing barrel export** — forgetting to add to `src/db/schema.ts` causes Drizzle relation errors
