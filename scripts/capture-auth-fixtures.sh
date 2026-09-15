#!/usr/bin/env bash
# Capture les réponses réelles des routes d'authentification du backend local.
# Prérequis : backend démarré (php artisan serve), compte technicien issu des seeders.
set -euo pipefail

API="${API_URL:-http://127.0.0.1:8000}"
ORIGIN="${STATEFUL_ORIGIN:-http://127.0.0.1:5173}"
EMAIL="${CAPTURE_EMAIL:-tech.electricien@reliance.cm}"
PASSWORD="${CAPTURE_PASSWORD:-password123}"
OUT="src/test/fixtures/auth"

WORK="$(mktemp -d)"
JAR="$WORK/cookies.txt"
RAW="$WORK/raw"
mkdir -p "$RAW"
trap 'rm -rf "$WORK"' EXIT

common=(-s -c "$JAR" -b "$JAR" -H "Origin: $ORIGIN" -H "Referer: $ORIGIN/" -H "Accept: application/json" -H "X-Requested-With: XMLHttpRequest")

xsrf() {
  python3 -c 'import sys, urllib.parse; print(urllib.parse.unquote(sys.argv[1]))' \
    "$(awk '$6 == "XSRF-TOKEN" { print $7 }' "$JAR" | tail -n 1)"
}

# $1 méthode, $2 chemin, $3 fichier, $4 statut attendu, $5 corps JSON (facultatif)
call() {
  local args=("${common[@]}" -X "$1" -o "$RAW/$3" -w '%{http_code}')
  local body="${5:-}"
  [[ -n "$body" ]] || body='{}'
  if [[ "$1" != "GET" ]]; then
    args+=(-H "X-XSRF-TOKEN: $(xsrf)" -H "Content-Type: application/json" -d "$body")
  fi
  local status
  status="$(curl "${args[@]}" "$API/api/v1$2")"
  if [[ "$status" != "$4" ]]; then
    echo "échec : $1 $2 → $status (attendu $4)" >&2
    cat "$RAW/$3" >&2
    exit 1
  fi
  echo "capturé : $1 $2 → $status"
}

curl "${common[@]}" -o /dev/null "$API/sanctum/csrf-cookie"

call POST /auth/login login-invalid.json 401 "{\"email\":\"$EMAIL\",\"password\":\"mot-de-passe-errone\"}"
call POST /auth/register register-validation-error.json 422 '{}'
call POST /auth/login login-success.json 200 "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
call GET /auth/me me.json 200
call POST /auth/logout logout.json 200

python3 scripts/anonymize-fixtures.py "$RAW" "$OUT"
