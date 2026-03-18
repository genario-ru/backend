---
name: env-propagation-checklist
description: Проводит добавление новой env-переменной через все обязательные уровни backend (schema, constants, Docker). Использовать при изменении конфигурации окружения.
---

# Env Propagation Checklist

## Когда использовать

При добавлении, переименовании или удалении переменной окружения.

## Обязательные точки обновления

1. `src/schemas/common/envs.ts` — тип и валидация переменной.
2. `src/constants/common/envs.ts` — прокидывание из `process.env`.
3. `docker-compose.yml` — переменная для `server` и `workers`.
4. `Dockerfile` — `ARG`/`ENV`, если переменная участвует в build/runtime образа.
5. `.env.example` — пример и документация по новой переменной.

## Порядок действий

1. Добавь переменную в schema и constants.
2. Протяни переменную в Docker-конфигурации.
3. Обнови `.env.example`.
4. Запусти минимальную проверку запуска (`pnpm dev` или релевантный workflow).

## Self-check

- Переменная валидируется на старте.
- Одинаковое имя переменной во всех файлах.
- Нет ситуации, когда `server` видит переменную, а `workers` — нет.
