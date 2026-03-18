---
name: openapi-codegen-kubb
description: Обновляет OpenAPI спецификации и регенерирует API-клиенты через Kubb в backend. Использовать при изменениях Tochka/YooKassa и codegen конфигурации.
---

# OpenAPI Codegen Kubb

## Когда использовать

- Обновилась внешняя OpenAPI спецификация.
- Меняется `kubb.config.ts`.
- Нужно пересобрать `src/codegen/api/**`.

## Порядок действий

1. Обнови спецификации:
   - `pnpm api:download:tochka`
   - `pnpm api:download:yookassa`
2. Запусти генерацию: `pnpm api:generate`.
3. Проверь `git diff` по `src/codegen/api/**`.
4. При необходимости скорректируй `kubb.config.ts` (например, `importPath`, transformers).
5. Повтори генерацию после изменений конфига.

## Правила

- Не вноси ручные правки в сгенерированные файлы без крайней необходимости.
- API-специфичные нормализации делай в download-скриптах.
- Проверяй, что generated код продолжает использовать проектные alias и ожидаемую структуру output.

## Self-check

- Генерация проходит без ошибок.
- В diff только ожидаемые изменения.
- Нет регресса в путях импортов клиентов и схем.
