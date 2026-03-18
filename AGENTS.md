# AGENTS Guide For Backend

Этот файл задает проектный контекст для AI-агентов и используется как точка входа в архитектуру.

## Проектный контекст

- Стек: TypeScript, Hono, Drizzle ORM, BullMQ, Zod, Kubb codegen.
- Entrypoints:
  - `src/entrypoints/server.ts` — HTTP API + docs + Bull Board.
  - `src/entrypoints/workers.ts` — фоновые workers и shutdown.
- Основные области:
  - `src/routes/` — API handlers.
  - `src/schemas/` — запросы/ответы и OpenAPI schemas.
  - `src/db/` — схемы/миграции БД.
  - `src/mq/` — queue/worker модули.
  - `src/lib/` — инфраструктурные интеграции.

## Рабочие команды

- API в watch: `pnpm dev`
- Workers в watch: `pnpm dev:workers`
- Build: `pnpm build`
- TypeScript check: `pnpm lint:typescript`
- ESLint: `pnpm lint:eslint`
- Prettier: `pnpm lint:prettier`
- Миграции: `pnpm db:generate && pnpm db:migrate`
- Codegen: `pnpm api:download:tochka && pnpm api:download:yookassa && pnpm api:generate`

## Правила внесения изменений

- Для API придерживайся route паттерна из `.cursor/rules/backend-route-pattern.mdc`.
- Для queue/worker придерживайся `.cursor/rules/backend-mq-pattern.mdc`.
- Для DB изменений придерживайся `.cursor/rules/backend-db-and-migrations.mdc`.
- Для codegen придерживайся `.cursor/rules/backend-codegen-openapi.mdc`.
- Для общих стандартов придерживайся `.cursor/rules/backend-core.mdc`.
- Для финализации любой задачи применяй `.cursor/rules/backend-change-validation.mdc`.

## Быстрые маршруты по задачам

- Новый endpoint:
  1) schema в `src/schemas/entities/...`,
  2) route в `src/routes/v1/...`,
  3) регистрация в `src/entrypoints/server.ts`.
- Новый worker:
  1) `src/mq/<domain>/<feature>/queue.ts` и `worker.ts`,
  2) регистрация в `src/entrypoints/workers.ts`,
  3) регистрация queue в Bull Board внутри `src/entrypoints/server.ts`.
- Новая env:
  1) `src/schemas/common/envs.ts`,
  2) `src/constants/common/envs.ts`,
  3) `docker-compose.yml` и `Dockerfile`,
  4) `.env.example`.

## Рекомендуемые skills

- Новый endpoint: `.cursor/skills/add-api-endpoint/SKILL.md`
- Новый worker: `.cursor/skills/add-bullmq-worker/SKILL.md`
- Изменение схемы БД: `.cursor/skills/drizzle-migration-workflow/SKILL.md`
- OpenAPI/codegen: `.cursor/skills/openapi-codegen-kubb/SKILL.md`
- Добавление env: `.cursor/skills/env-propagation-checklist/SKILL.md`
- Подбор проверок: `.cursor/skills/change-validation-matrix/SKILL.md`

## Связанные документы

- Архитектурная карта: `docs/architecture/backend-modules.md`
- Чеклисты разработки: `docs/workflows/development-checklists.md`
- Матрица проверок: `docs/workflows/verification-matrix.md`
- Repeatable workflows: `.cursor/skills/*/SKILL.md`
