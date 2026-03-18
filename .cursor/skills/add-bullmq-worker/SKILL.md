---
name: add-bullmq-worker
description: Добавляет новую BullMQ очередь и worker в backend с обязательной регистрацией в workers shutdown и Bull Board. Использовать при добавлении новых фоновых задач в src/mq.
---

# Add BullMQ Worker

## Цель

Создать новый модуль фоновой обработки без пропуска интеграционных шагов.

## Порядок действий

1. Создай папку `src/mq/<domain>/<feature>/`.
2. Добавь `queue.ts`:
   - константа имени очереди;
   - `Queue<JobData>` с общей Redis-конфигурацией;
   - helper `enqueue...(...)`.
3. Добавь `worker.ts`:
   - `Worker<JobData>`;
   - обработчик job с валидацией входа;
   - унифицированная обработка ошибок.
4. Обнови `src/entrypoints/workers.ts`:
   - импорт worker;
   - `await worker.close()` в `shutdown`.
5. Обнови `src/entrypoints/server.ts`:
   - импорт queue;
   - `new BullMQAdapter(queue)` в `createBullBoard`.

## Self-check

- Queue и worker используют один `QUEUE_NAME`.
- Worker корректно закрывается через shutdown.
- Очередь отображается в `/admin/queues`.
- В payload нет `any`, есть тип `JobData`.
