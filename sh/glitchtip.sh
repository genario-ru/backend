#!/usr/bin/env bash

set -euo pipefail

require_glitchtip_env() {
  test -n "${GLITCHTIP_URL:-}" || {
    echo "::error::Missing GLITCHTIP_URL secret"
    exit 1
  }
  test -n "${GLITCHTIP_AUTH_TOKEN:-}" || {
    echo "::error::Missing GLITCHTIP_AUTH_TOKEN secret"
    exit 1
  }
  test -n "${GLITCHTIP_ORG:-}" || {
    echo "::error::Missing GLITCHTIP_ORG secret"
    exit 1
  }
  test -n "${GLITCHTIP_PROJECT:-}" || {
    echo "::error::Missing GLITCHTIP_PROJECT secret"
    exit 1
  }
}

require_sourcemap_build_env() {
  test -n "${GLITCHTIP_RELEASE:-}" || {
    echo "::error::Missing GLITCHTIP_RELEASE value"
    exit 1
  }
}

export_cli_env() {
  export SENTRY_URL="${GLITCHTIP_URL}"
  export SENTRY_AUTH_TOKEN="${GLITCHTIP_AUTH_TOKEN}"
  export SENTRY_ORG="${GLITCHTIP_ORG}"
  export SENTRY_PROJECT="${GLITCHTIP_PROJECT}"
}

validate_config() {
  require_glitchtip_env
  require_sourcemap_build_env
}

upload_sourcemaps() {
  local dist_dir="${1:?Expected dist directory as the first argument}"
  local release="${2:?Expected release as the second argument}"

  require_glitchtip_env
  export_cli_env
  export SENTRY_RELEASE="${release}"

  local release_create_output
  if ! release_create_output="$(sentry-cli releases new "${release}" 2>&1)"; then
    if grep -Eiq "already exists|exists already|exists" <<<"${release_create_output}"; then
      echo "GlitchTip release already exists, continuing"
    else
      echo "${release_create_output}"
      exit 1
    fi
  fi

  echo "Found $(find "${dist_dir}" -type f -name '*.map' | wc -l) sourcemap files before upload"
  sentry-cli sourcemaps inject "${dist_dir}"
  echo "Injected debug IDs into $(grep -R --include='*.js' -l 'debugId' "${dist_dir}" | wc -l) JavaScript files"
  sentry-cli sourcemaps upload "${dist_dir}" --release "${release}"
  find "${dist_dir}" -type f -name '*.map' -delete
  sentry-cli releases finalize "${release}"
}

record_deploy() {
  local release="${1:?Expected release as the first argument}"
  local environment="${2:?Expected environment as the second argument}"
  local deploy_url="${3:-}"

  require_glitchtip_env
  export_cli_env

  local encoded_release
  encoded_release="$(python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1], safe=""))' "${release}")"

  local payload
  payload="$(
    DEPLOY_ENVIRONMENT="${environment}" DEPLOY_URL="${deploy_url}" python3 - <<'PY'
import json
import os

print(json.dumps({
    "environment": os.environ["DEPLOY_ENVIRONMENT"],
    "url": os.environ["DEPLOY_URL"],
}))
PY
  )"

  curl --fail-with-body --show-error --silent \
    --request POST \
    --url "${SENTRY_URL%/}/api/0/organizations/${SENTRY_ORG}/releases/${encoded_release}/deploys/" \
    --header "Authorization: Bearer ${SENTRY_AUTH_TOKEN}" \
    --header "Content-Type: application/json" \
    --data "${payload}" \
    > /dev/null

  echo "Created deploy for release ${release} in environment ${environment}."
}

case "${1:-}" in
  validate-config)
    validate_config
    ;;
  upload-sourcemaps)
    upload_sourcemaps "${2:-}" "${3:-}"
    ;;
  record-deploy)
    record_deploy "${2:-}" "${3:-}" "${4:-}"
    ;;
  *)
    echo "Usage: $0 {validate-config|upload-sourcemaps <dist-dir> <release>|record-deploy <release> <environment> [deploy-url]}"
    exit 1
    ;;
esac
