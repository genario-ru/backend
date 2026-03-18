---
name: add-api-endpoint
description: Добавляет новый endpoint в backend по проектному паттерну Hono + Zod + OpenAPI и с правильным подключением route в server entrypoint. Использовать при создании новых API handlers.
---

# Add API Endpoint

## Цель

Добавить endpoint без пропуска schema-валидации, OpenAPI и подключения в роутер.

## Порядок действий

1. Определи место endpoint в `src/routes/v1/...`.
2. Создай/обнови схемы в `src/schemas/entities/.../handlers/<handler>/`:
   - `params.ts` при наличии path params;
   - `query.ts` при query параметрах;
   - `body.ts` для тела запроса;
   - `response.ts` для ответа.
3. Реализуй route:
   - `createHonoApp().basePath(...)`;
   - middleware в проектном порядке;
   - `validator(...)` для входа;
   - `throwAPIError(...)` для доменных ошибок;
   - `c.json<ResponseType>(responseSchema.parse({ data }))`.
4. Подключи route в `src/entrypoints/server.ts`.
5. Убедись, что endpoint появляется в OpenAPI.

## Self-check

- Endpoint подключен в `server.ts`.
- Все входы и выход типизированы через schema.
- Ответ не возвращается в обход `responseSchema.parse`.
- Нет необоснованного `any`.
