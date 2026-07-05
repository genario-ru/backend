#!/usr/bin/env bash
# Post-edit hook: prints non-blocking reminders after file edits.

INPUT=$(cat)

FILE=$(printf '%s' "$INPUT" | python3 -c '
import json
import sys

try:
    data = json.load(sys.stdin)
except Exception:
    print("")
    raise SystemExit

tool_input = data.get("tool_input", {}) or {}
file_path = tool_input.get("file_path") or ""
print(file_path)
' 2>/dev/null)

case "$FILE" in
  */src/db/schemas/*.ts|*/src/db/schemas/*/*.ts)
    echo "[hook] DB schema changed: do not generate/apply migrations from AI workflow; owner must generate migration."
    ;;
esac

case "$FILE" in
  */src/entrypoints/server.ts)
    echo "[hook] server.ts changed: verify API route registration and Bull Board queue registration."
    ;;
  */src/entrypoints/workers.ts)
    echo "[hook] workers.ts changed: verify every worker is imported and closed in shutdown()."
    ;;
  */src/mq/*/queue.ts)
    echo "[hook] Queue changed: verify matching worker, enqueue helper, and Bull Board registration in server.ts."
    ;;
  */src/mq/*/worker.ts)
    echo "[hook] Worker changed: verify worker startup and shutdown registration in workers.ts."
    ;;
  */env.ts)
    echo "[hook] env.ts changed: verify .env.example and both server/workers env blocks in docker-compose.yml."
    ;;
  */.env.example)
    echo "[hook] .env.example changed: verify env.ts validates the same variable names."
    ;;
  */docker-compose.yml)
    echo "[hook] docker-compose.yml changed: verify server and workers receive the same runtime env variables."
    ;;
  */src/ai/prompts/templates/*.md|*/src/ai/prompts/types/*.ts|*/src/ai/prompts/builders/*.ts)
    echo "[hook] AI prompt changed: verify template placeholders, props type, builder variables, and call sites stay synchronized."
    ;;
  */kubb.config.ts|*/deps/api/*.json|*/scripts/download-*-openapi.ts)
    echo "[hook] Codegen input changed: run pnpm api:generate and inspect src/codegen/api diff."
    ;;
esac

exit 0
