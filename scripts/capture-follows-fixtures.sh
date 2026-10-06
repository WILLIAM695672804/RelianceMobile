#!/usr/bin/env bash
# Capture les réponses réelles du suivi de comptes (abonnements du fil social).
# Prérequis : `php artisan serve --port=8010`.
# Effets de bord : le client de capture suit puis cesse de suivre le technicien de test.
set -euo pipefail

API="${API_URL:-http://127.0.0.1:8010}"
ORIGIN="${STATEFUL_ORIGIN:-http://127.0.0.1:5173}"
TECH_EMAIL="${CAPTURE_TECH_EMAIL:-tech.electricien@reliance.cm}"
CLIENT_EMAIL="${CAPTURE_CLIENT_EMAIL:-client.capture@example.test}"
PASSWORD="${CAPTURE_PASSWORD:-password123}"
OUT="src/test/fixtures"

WORK="$(mktemp -d)"
RAW="$WORK/raw"
mkdir -p "$RAW/follows" "$RAW/session"
trap 'rm -rf "$WORK"' EXIT

JAR=""
headers=(-H "Origin: $ORIGIN" -H "Referer: $ORIGIN/" -H "Accept: application/json" -H "X-Requested-With: XMLHttpRequest")
json=(-H "Content-Type: application/json")

xsrf() {
  python3 -c 'import sys, urllib.parse; print(urllib.parse.unquote(sys.argv[1]))' \
    "$(awk '$6 == "XSRF-TOKEN" { print $7 }' "$JAR" | tail -n 1)"
}

field() {
  python3 -c 'import json, sys; data = json.load(open(sys.argv[1])); [data := data[int(k)] if k.isdigit() else data[k] for k in sys.argv[2:]]; print(data)' "$@"
}

open_session() {
  JAR="$WORK/$1.cookies"
  curl -s -c "$JAR" -b "$JAR" "${headers[@]}" -o /dev/null "$API/sanctum/csrf-cookie"
}

call() {
  local method="$1" path="$2" file="$3" expected="$4"
  shift 4
  local args=(-s -c "$JAR" -b "$JAR" "${headers[@]}" -X "$method" -o "$RAW/$file" -w '%{http_code}')
  if [[ "$method" != "GET" ]]; then
    args+=(-H "X-XSRF-TOKEN: $(xsrf)")
  fi
  local status
  status="$(curl "${args[@]}" "$@" "$API/api/v1$path")"
  if [[ "$status" != "$expected" ]]; then
    echo "échec : $method $path → $status (attendu $expected)" >&2
    cat "$RAW/$file" >&2
    exit 1
  fi
  echo "capturé : $method $path → $status"
}

login() {
  call POST /auth/login "session/login-$1.json" 200 "${json[@]}" -d "{\"email\":\"$2\",\"password\":\"$PASSWORD\"}"
}

open_session technician
login technician "$TECH_EMAIL"
call GET /auth/me session/technician-me.json 200
TECH="$(field "$RAW/session/technician-me.json" user id)"
call POST /auth/logout session/logout-technician.json 200

open_session client
login client "$CLIENT_EMAIL"

call GET "/follows/$TECH/check" follows/check-before.json 200
FOLLOW_STATUS="$(curl -s -c "$JAR" -b "$JAR" "${headers[@]}" -H "X-XSRF-TOKEN: $(xsrf)" -X POST \
  -o "$RAW/follows/followed.json" -w '%{http_code}' "$API/api/v1/follows/$TECH")"
echo "capturé : POST /follows/{id} → $FOLLOW_STATUS"
call GET "/follows/$TECH/check" follows/check-after.json 200
call GET "/users/$TECH/follow-counts" follows/counts.json 200
call GET "/users/$TECH/followers" follows/followers.json 200
call GET "/users/$TECH/following" follows/following.json 200
call GET /follows/suggestions follows/suggestions.json 200
call GET /posts/feed follows/feed-after-follow.json 200
call DELETE "/follows/$TECH" follows/unfollowed.json 200
call POST /auth/logout session/logout-client.json 200

python3 scripts/anonymize-fixtures.py "$RAW/follows" "$OUT/follows"
