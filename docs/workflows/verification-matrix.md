# Verification Matrix

Матрица минимально достаточных проверок по типу изменений.

## Базовая проверка (почти всегда)

- `pnpm lint:typescript`

## Если менялся API слой (`src/routes`, `src/schemas`, `src/middleware`)

- `pnpm lint:typescript`
- `pnpm lint:eslint`

## Если менялась БД (`src/db`, миграции)

- `pnpm lint:typescript`
- `pnpm db:generate` (для schema изменений)
- `pnpm db:migrate` (если есть доступ к локальной БД)

## Если менялись MQ/Workers (`src/mq`, `src/entrypoints/workers.ts`)

- `pnpm lint:typescript`
- `pnpm lint:eslint`
- Smoke-проверка запуска worker процесса (`pnpm dev:workers`) при необходимости

## Если менялись env/docker (`envs`, `docker-compose.yml`, `Dockerfile`)

- `pnpm lint:typescript`
- Проверка консистентности переменных между:
  - `src/schemas/common/envs.ts`
  - `src/constants/common/envs.ts`
  - `.env.example`
  - `docker-compose.yml` (`server` и `workers`)
  - `Dockerfile` (если используется ARG/ENV)

## Если менялся codegen (`kubb.config.ts`, `scripts/download-*-openapi.ts`, `src/codegen`)

- `pnpm api:download:tochka`
- `pnpm api:download:yookassa`
- `pnpm api:generate`
- Проверка diff в `src/codegen/api/**`

## Правило фиксации результата

В итоге задачи всегда явно указывать:

- что именно проверено;
- что не проверено;
- почему не проверено (если применимо).
