#!/usr/bin/env bash
# Post-edit hook: warns Claude when follow-up commands are required.
# Receives tool use JSON on stdin; exits 0 always (non-blocking).

INPUT=$(cat)

FILE=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    f = d.get('tool_input', {}).get('file_path', '') or ''
    print(f)
except Exception:
    print('')
" 2>/dev/null)

# DB schema changed → migration required
if [[ "$FILE" == */src/db/schemas/* ]] && [[ "$FILE" == *.ts ]]; then
  echo "[hook] DB schema modified: $(basename "$FILE") → run: pnpm db:generate && pnpm db:migrate"
fi

# server.ts changed → check route registration and Bull Board
if [[ "$FILE" == */entrypoints/server.ts ]]; then
  echo "[hook] server.ts modified → verify: route registered with app.route(), queue added to Bull Board"
fi

# workers.ts changed → check worker shutdown
if [[ "$FILE" == */entrypoints/workers.ts ]]; then
  echo "[hook] workers.ts modified → verify: worker imported and closed in shutdown()"
fi

# MQ queue file changed → remind about Bull Board registration
if [[ "$FILE" == */src/mq/*/queue.ts ]]; then
  echo "[hook] Queue file modified: $(basename "$(dirname "$FILE")") → verify queue is registered in Bull Board (server.ts)"
fi

# MQ worker file changed → remind about workers.ts registration
if [[ "$FILE" == */src/mq/*/worker.ts ]]; then
  echo "[hook] Worker file modified: $(basename "$(dirname "$FILE")") → verify worker is closed in shutdown (workers.ts)"
fi

# Env schema or constants changed → remind about all 4 propagation points
if [[ "$FILE" == */env.ts ]]; then
  echo "[hook] Env config modified → check all 4 points: env.ts, docker-compose.yml, .env.example"
fi

# .env.example changed → remind about schema
if [[ "$FILE" == */.env.example ]]; then
  echo "[hook] .env.example modified → verify variable is also in env.ts"
fi

# docker-compose.yml changed → remind about env consistency
if [[ "$FILE" == */docker-compose.yml ]]; then
  echo "[hook] docker-compose.yml modified → verify both 'server' and 'workers' services have the same env variables"
fi

exit 0
