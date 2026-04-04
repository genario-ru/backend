FROM node:22-alpine AS base
RUN npm install -g pnpm@10

FROM base AS builder
RUN apk add --no-cache gcompat
WORKDIR /app

# Копируем файлы зависимостей
COPY package.json pnpm-lock.yaml ./
COPY tsconfig.json tsup.config.ts drizzle.config.ts auth.ts ./

# Копируем исходный код
COPY src ./src

# Устанавливаем зависимости и собираем проект
RUN pnpm install --frozen-lockfile && \
    pnpm run build && \
    pnpm prune --production

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

# Копируем собранные файлы и зависимости
COPY --from=builder --chown=hono:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=hono:nodejs /app/dist /app/dist
COPY --from=builder --chown=hono:nodejs /app/package.json /app/package.json

USER hono
EXPOSE 3000

CMD ["pnpm", "run", "start"]