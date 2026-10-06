#!/usr/bin/env bash
# Capture les réponses réelles du planning du technicien et des rendez-vous.
# Prérequis : `php artisan serve --port=8010` et `php artisan websockets:serve`.
# Effets de bord : un créneau récurrent, une indisponibilité et un rendez-vous de démonstration
# sont créés pour le technicien de test (le créneau et l'indisponibilité sont ensuite supprimés).
set -euo pipefail

API="${API_URL:-http://127.0.0.1:8010}"
ORIGIN="${STATEFUL_ORIGIN:-http://127.0.0.1:5173}"
TECH_EMAIL="${CAPTURE_TECH_EMAIL:-tech.electricien@reliance.cm}"
CLIENT_EMAIL="${CAPTURE_CLIENT_EMAIL:-client.capture@example.test}"
PASSWORD="${CAPTURE_PASSWORD:-password123}"
OUT="src/test/fixtures"

WORK="$(mktemp -d)"
RAW="$WORK/raw"
mkdir -p "$RAW/planning" "$RAW/session"
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

TOMORROW="$(python3 -c 'import datetime; print((datetime.datetime.now() + datetime.timedelta(days=1)).strftime("%Y-%m-%dT09:00:00"))')"
TOMORROW_END="$(python3 -c 'import datetime; print((datetime.datetime.now() + datetime.timedelta(days=1)).strftime("%Y-%m-%dT11:00:00"))')"
LEAVE_START="$(python3 -c 'import datetime; print((datetime.datetime.now() + datetime.timedelta(days=3)).strftime("%Y-%m-%dT00:00:00"))')"
LEAVE_END="$(python3 -c 'import datetime; print((datetime.datetime.now() + datetime.timedelta(days=4)).strftime("%Y-%m-%dT23:59:00"))')"

# ── Client : une demande support du rendez-vous ──────────────────────────
open_session client
login client "$CLIENT_EMAIL"
call GET /requests session/requests.json 200
REQUEST="$(field "$RAW/session/requests.json" data 0 id)"
call POST /auth/logout session/logout-client.json 200

# ── Technicien : créneaux, indisponibilités, rendez-vous ─────────────────
open_session technician
login technician "$TECH_EMAIL"
call GET /auth/me session/technician-me.json 200
TECH="$(field "$RAW/session/technician-me.json" user id)"

call GET /technician/calendar planning/calendar-empty.json 200
call POST /technician/time-slots planning/slot-validation-error.json 422 "${json[@]}" -d '{}'
call POST /technician/time-slots planning/slot-created.json 201 "${json[@]}" \
  -d '{"day_of_week":1,"start_time":"08:00","end_time":"17:00","repeat_weekly":true}'
SLOT="$(field "$RAW/planning/slot-created.json" data id)"

call POST /technician/exceptions planning/exception-validation-error.json 422 "${json[@]}" -d '{}'
call POST /technician/exceptions planning/exception-created.json 201 "${json[@]}" \
  -d "{\"start_ts\":\"$LEAVE_START\",\"end_ts\":\"$LEAVE_END\",\"reason\":\"Congé de démonstration\"}"
EXCEPTION="$(field "$RAW/planning/exception-created.json" data id)"

call POST /appointments planning/appointment-validation-error.json 422 "${json[@]}" -d '{}'
call POST /appointments planning/appointment-created.json 201 "${json[@]}" \
  -d "{\"request_id\":\"$REQUEST\",\"technician_id\":\"$TECH\",\"scheduled_start\":\"$TOMORROW\",\"scheduled_end\":\"$TOMORROW_END\",\"notes\":\"Intervention de démonstration\"}"
APPOINTMENT="$(field "$RAW/planning/appointment-created.json" data id)"

call GET /technician/calendar planning/calendar.json 200
call GET /appointments planning/appointments.json 200
call GET /appointments/upcoming planning/appointments-upcoming.json 200
call GET "/appointments/$APPOINTMENT" planning/appointment.json 200
call PATCH "/appointments/$APPOINTMENT/status" planning/appointment-confirmed.json 200 "${json[@]}" \
  -d '{"status":"confirmed"}'

call DELETE "/technician/exceptions/$EXCEPTION" planning/exception-deleted.json 200
call DELETE "/technician/time-slots/$SLOT" planning/slot-deleted.json 200
call POST /auth/logout session/logout-technician.json 200

python3 scripts/anonymize-fixtures.py "$RAW/planning" "$OUT/planning"
