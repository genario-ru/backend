# Development Checklists

Короткие чеклисты для типовых изменений в backend.

## 1) Новый API route

- Создана схема запроса/ответа в `src/schemas/entities/...`.
- Route использует `createHonoApp()` и стандартный порядок middleware.
- Есть `validator("param"/"json")` для входных данных.
- Ответ возвращается через `responseSchema.parse(...)`.
- Route подключен в `src/entrypoints/server.ts`.

## 2) Изменение схемы БД

- Обновлены файлы в `src/db/schemas/**`.
- Выполнено `pnpm db:generate`.
- Выполнено `pnpm db:migrate`.
- Проверено, что SQL миграция соответствует изменению модели.
- Изменения schema + migration идут в одном наборе изменений.

## 3) Новый BullMQ worker

- Добавлены `queue.ts` и `worker.ts` в `src/mq/<domain>/<feature>/`.
- Типизирован payload job-данных.
- Worker добавлен в `src/entrypoints/workers.ts` (включая shutdown).
- Queue добавлена в Bull Board в `src/entrypoints/server.ts`.
- Проверено, что queue видна в `/admin/queues`.

## 4) Обновление OpenAPI codegen

- Обновлены спецификации (`api:download:*`).
- Выполнена генерация (`api:generate`).
- Проверен diff в `src/codegen/api/**`.
- При изменении `kubb.config.ts` проверены `importPath` и transformers.
- Нет неожиданных ручных правок в generated файлах.

## 5) Добавление новой env переменной

- Переменная добавлена в `src/schemas/common/envs.ts`.
- Переменная добавлена в `src/constants/common/envs.ts`.
- Переменная протянута в `docker-compose.yml` для `server` и `workers`.
- При необходимости добавлена в `Dockerfile`.
- Обновлен `.env.example`.

## 6) Финальная верификация перед завершением задачи

- Проверки выбраны по `docs/workflows/verification-matrix.md`.
- Выполнен минимум `pnpm lint:typescript`.
- Явно указано, что проверено и что не проверено.
