#!/usr/bin/env bash
# Capture les réponses réelles du cycle de vie d'une mission (suivi d'intervention).
# Prérequis : `php artisan serve --port=8010`, `php artisan websockets:serve`,
# et une proposition acceptée par le technicien de test (voir capture-matching-fixtures.sh).
# Effets de bord : un job est créé puis mené jusqu'au statut « completed ».
set -euo pipefail

API="${API_URL:-http://127.0.0.1:8010}"
ORIGIN="${STATEFUL_ORIGIN:-http://127.0.0.1:5173}"
TECH_EMAIL="${CAPTURE_TECH_EMAIL:-tech.electricien@reliance.cm}"
CLIENT_EMAIL="${CAPTURE_CLIENT_EMAIL:-client.capture@example.test}"
PASSWORD="${CAPTURE_PASSWORD:-password123}"
OUT="src/test/fixtures"

WORK="$(mktemp -d)"
RAW="$WORK/raw"
mkdir -p "$RAW/missions" "$RAW/session"
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

# ── Technicien : mission acceptée menée de bout en bout ───────────────────
open_session technician
login technician "$TECH_EMAIL"
call GET /proposals/active-mission missions/active-mission.json 200
REQUEST="$(field "$RAW/missions/active-mission.json" data request id)"

call POST /jobs missions/job-created.json 201 "${json[@]}" -d "{\"request_id\":\"$REQUEST\"}"
JOB="$(field "$RAW/missions/job-created.json" data id)"

call PATCH "/jobs/$JOB/status" missions/status-validation-error.json 422 "${json[@]}" -d '{}'
call PATCH "/jobs/$JOB/status" missions/job-en-route.json 200 "${json[@]}" -d '{"status":"en_route"}'
call POST /position/update missions/position-updated.json 200 "${json[@]}" \
  -d '{"latitude":3.8520,"longitude":11.5030}'
call PATCH "/jobs/$JOB/status" missions/job-arrived.json 200 "${json[@]}" -d '{"status":"arrived"}'
call PATCH "/jobs/$JOB/status" missions/job-in-progress.json 200 "${json[@]}" -d '{"status":"in_progress"}'

call PUT "/jobs/$JOB/phases" missions/phases-validation-error.json 422 "${json[@]}" -d '{}'
call PUT "/jobs/$JOB/phases" missions/job-phases.json 200 "${json[@]}" -d '{"phases":[{"title":"Diagnostic","status":"completed","notes":"Prise hors tension"},{"title":"Remplacement de la prise","status":"in_progress","notes":null}]}'

call GET /jobs missions/jobs.json 200
call GET "/jobs/$JOB" missions/job.json 200
call GET "/jobs/$JOB/tracking" missions/tracking.json 200
call PATCH "/jobs/$JOB/status" missions/job-completed.json 200 "${json[@]}" \
  -d '{"status":"completed","completion_notes":"Prise remplacée et testée."}'
call POST /auth/logout session/logout-technician.json 200

# ── Client : suivi de sa mission ──────────────────────────────────────────
open_session client
login client "$CLIENT_EMAIL"
call GET /mission/active missions/client-mission.json 200
call GET /position/technician missions/technician-position.json 200
call GET "/jobs/$JOB/tracking" missions/client-tracking.json 200
call POST /auth/logout session/logout-client.json 200

python3 scripts/anonymize-fixtures.py "$RAW/missions" "$OUT/missions"
