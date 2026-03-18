# Backend Modules Map

Этот документ — краткая карта модулей backend для проектирования изменений и ревью.

## Основные зоны

- `src/entrypoints/server.ts` — HTTP-приложение, регистрация route, OpenAPI, Bull Board.
- `src/entrypoints/workers.ts` — запуск и graceful shutdown всех BullMQ workers.
- `src/routes/` — обработчики API (Hono), orchestration бизнес-логики и валидации.
- `src/schemas/` — Zod-схемы запросов/ответов и OpenAPI-метаданные.
- `src/db/` — Drizzle schema, связи, миграции и доступ к Postgres.
- `src/mq/` — очереди и воркеры фоновых задач.
- `src/ai/` — провайдеры моделей, промпты, AI-агенты.
- `src/lib/` — интеграции (S3, Redis, PDF, image, external APIs).

## Базовые архитектурные договоренности

- Для route используется `createHonoApp()` и middleware-first структура.
- Для API-валидации используется `validator(...)` + Zod-схемы из `src/schemas`.
- Ответы route возвращаются через `responseSchema.parse(...)`.
- Для ошибок API используется `throwAPIError(...)`.
- Для фоновых задач действует парный паттерн `queue.ts` + `worker.ts`.

## Точки синхронизации при изменениях

- Новый endpoint: `src/routes/...` + `src/schemas/...` + подключение в `src/entrypoints/server.ts`.
- Новый worker/queue: `src/mq/...` + регистрация shutdown в `src/entrypoints/workers.ts` + Bull Board в `src/entrypoints/server.ts`.
- Новая env-переменная: `src/schemas/common/envs.ts` + `src/constants/common/envs.ts` + Docker-конфиги.
- Изменение DB схемы: `src/db/schemas/...` + генерация/применение миграций.

## Команды рабочего цикла

- Dev API: `pnpm dev`
- Dev workers: `pnpm dev:workers`
- Type check: `pnpm lint:typescript`
- ESLint: `pnpm lint:eslint`
- Prettier: `pnpm lint:prettier`
- Migrations: `pnpm db:generate && pnpm db:migrate`
- OpenAPI codegen: `pnpm api:download:tochka && pnpm api:download:yookassa && pnpm api:generate`
