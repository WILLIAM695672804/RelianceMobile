#!/usr/bin/env bash
# Capture les réponses réelles du portefeuille et des avis.
# Prérequis : `php artisan serve --port=8010`, `php artisan websockets:serve`,
# et une mission acceptée par le technicien de test (voir capture-matching-fixtures.sh).
# Effets de bord : une mission est clôturée (ce qui clôt la demande), un avis est déposé,
# une recharge et un retrait sont demandés.
set -euo pipefail

API="${API_URL:-http://127.0.0.1:8010}"
ORIGIN="${STATEFUL_ORIGIN:-http://127.0.0.1:5173}"
TECH_EMAIL="${CAPTURE_TECH_EMAIL:-tech.electricien@reliance.cm}"
CLIENT_EMAIL="${CAPTURE_CLIENT_EMAIL:-client.capture@example.test}"
PASSWORD="${CAPTURE_PASSWORD:-password123}"
OUT="src/test/fixtures"

WORK="$(mktemp -d)"
RAW="$WORK/raw"
mkdir -p "$RAW/wallet" "$RAW/reviews" "$RAW/session"
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

# ── Technicien : portefeuille, retrait et clôture d'une mission ──────────
open_session technician
login technician "$TECH_EMAIL"
call GET /auth/me session/technician-me.json 200
TECH="$(field "$RAW/session/technician-me.json" user id)"

call GET /wallet wallet/wallet.json 200
call GET /wallet/transactions wallet/transactions.json 200
call POST /wallet/withdraw wallet/withdraw-validation-error.json 422 "${json[@]}" -d '{}'
call POST /wallet/withdraw wallet/withdraw-insufficient.json 422 "${json[@]}" \
  -d '{"amount":500000,"method":"momo","phone_number":"600000000"}'

call GET /proposals/active-mission session/active-mission.json 200
REQUEST="$(field "$RAW/session/active-mission.json" data request id)"
call POST /jobs session/job.json 201 "${json[@]}" -d "{\"request_id\":\"$REQUEST\"}"
JOB="$(field "$RAW/session/job.json" data id)"
call PATCH "/jobs/$JOB/status" session/job-completed.json 200 "${json[@]}" \
  -d '{"status":"completed","completion_notes":"Intervention achevée."}'
call POST /auth/logout session/logout-technician.json 200

# ── Client : portefeuille, recharge et avis ──────────────────────────────
open_session client
login client "$CLIENT_EMAIL"
call GET /wallet wallet/wallet-client.json 200
call POST /wallet/recharge wallet/recharge-validation-error.json 422 "${json[@]}" -d '{}'
# La passerelle NotchPay n'est pas joignable en local : la réponse 422 est le cas réel.
RECHARGE_STATUS="$(curl -s -c "$JAR" -b "$JAR" "${headers[@]}" "${json[@]}" -H "X-XSRF-TOKEN: $(xsrf)" \
  -X POST -o "$RAW/wallet/recharge.json" -w '%{http_code}' \
  -d '{"amount":5000,"method":"momo","phone_number":"600000000"}' "$API/api/v1/wallet/recharge")"
echo "capturé : POST /wallet/recharge → $RECHARGE_STATUS"

call POST /reviews reviews/review-validation-error.json 422 "${json[@]}" -d '{}'
call POST /reviews reviews/review-created.json 201 "${json[@]}" \
  -d "{\"request_id\":\"$REQUEST\",\"rating\":5,\"comment\":\"Intervention rapide et soignée.\"}"
call POST /reviews reviews/review-duplicate.json 409 "${json[@]}" \
  -d "{\"request_id\":\"$REQUEST\",\"rating\":4,\"comment\":\"Doublon\"}"
call GET "/reviews/technician/$TECH" reviews/technician-reviews.json 200
call GET /badges reviews/badges.json 200
call GET "/badges/user/$TECH" reviews/user-badges.json 200
call GET "/reputation/$TECH" reviews/reputation.json 200
call POST /auth/logout session/logout-client.json 200

# ── Technicien : avis reçus ──────────────────────────────────────────────
JAR="$WORK/technician.cookies"
login technician "$TECH_EMAIL"
call GET /reviews/mine reviews/my-reviews.json 200
call POST /auth/logout session/logout-technician2.json 200

python3 scripts/anonymize-fixtures.py "$RAW/wallet" "$OUT/wallet"
python3 scripts/anonymize-fixtures.py "$RAW/reviews" "$OUT/reviews"
