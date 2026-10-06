#!/usr/bin/env bash
# Capture les réponses réelles des devis et des factures.
# Prérequis : `php artisan serve --port=8010`, `php artisan websockets:serve`,
# et une demande attribuée au technicien de test (voir capture-matching-fixtures.sh).
# Effets de bord : deux devis créés (l'un accepté, l'autre rejeté), une facture générée puis payée.
set -euo pipefail

API="${API_URL:-http://127.0.0.1:8010}"
ORIGIN="${STATEFUL_ORIGIN:-http://127.0.0.1:5173}"
TECH_EMAIL="${CAPTURE_TECH_EMAIL:-tech.electricien@reliance.cm}"
CLIENT_EMAIL="${CAPTURE_CLIENT_EMAIL:-client.capture@example.test}"
PASSWORD="${CAPTURE_PASSWORD:-password123}"
OUT="src/test/fixtures"

WORK="$(mktemp -d)"
RAW="$WORK/raw"
mkdir -p "$RAW/billing" "$RAW/session"
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

VALID_UNTIL="$(python3 -c 'import datetime; print((datetime.date.today() + datetime.timedelta(days=7)).isoformat())')"

# ── Technicien : rédaction et envoi de deux devis ─────────────────────────
open_session technician
login technician "$TECH_EMAIL"
call GET /proposals/active-mission session/active-mission.json 200
REQUEST="$(field "$RAW/session/active-mission.json" data request id)"

call POST /quotes billing/quote-validation-error.json 422 "${json[@]}" -d '{}'
call POST /quotes billing/quote-created.json 201 "${json[@]}" -d "{\"request_id\":\"$REQUEST\",\"total_amount\":18000,\"breakdown\":[{\"label\":\"Main d'œuvre\",\"amount\":12000},{\"label\":\"Pièces\",\"amount\":6000}],\"valid_until\":\"$VALID_UNTIL\"}"
QUOTE="$(field "$RAW/billing/quote-created.json" data id)"
call POST "/quotes/$QUOTE/send" billing/quote-sent.json 200
call POST "/quotes/$QUOTE/send" billing/quote-send-error.json 422

call POST /quotes session/quote-second.json 201 "${json[@]}" -d "{\"request_id\":\"$REQUEST\",\"total_amount\":25000}"
SECOND="$(field "$RAW/session/quote-second.json" data id)"
call POST "/quotes/$SECOND/send" session/quote-second-sent.json 200

call GET "/requests/$REQUEST/quotes" billing/quotes.json 200
call GET "/quotes/$QUOTE" billing/quote.json 200
call POST /auth/logout session/logout-technician.json 200

# ── Client : acceptation, rejet, facture ─────────────────────────────────
open_session client
login client "$CLIENT_EMAIL"
call POST "/quotes/$QUOTE/accept" billing/quote-accepted.json 200
INVOICE="$(field "$RAW/billing/quote-accepted.json" data invoice_id)"
call POST "/quotes/$SECOND/reject" billing/quote-rejected.json 200
call POST "/quotes/$QUOTE/accept" billing/quote-accept-error.json 422

call GET /invoices billing/invoices.json 200
call GET "/invoices/$INVOICE" billing/invoice.json 200
call POST "/invoices/$INVOICE/pay" billing/invoice-paid.json 200
call POST "/invoices/$INVOICE/pay" billing/invoice-pay-error.json 422
call POST /auth/logout session/logout-client.json 200

python3 scripts/anonymize-fixtures.py "$RAW/billing" "$OUT/billing"
