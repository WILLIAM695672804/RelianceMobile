#!/usr/bin/env bash
# Capture les réponses réelles des routes demandes et rapprochement du backend local.
# Prérequis : `php artisan serve --port=8010` et `php artisan websockets:serve` (diffusion synchrone).
# Effets de bord sur la base locale : compte client de capture créé au besoin ; deux demandes créées ;
# une proposition refusée et une proposition acceptée par le technicien de capture.
set -euo pipefail

API="${API_URL:-http://127.0.0.1:8010}"
ORIGIN="${STATEFUL_ORIGIN:-http://127.0.0.1:5173}"
CLIENT_EMAIL="${CAPTURE_CLIENT_EMAIL:-client.capture@example.test}"
TECH_EMAIL="${CAPTURE_TECH_EMAIL:-tech.electricien@reliance.cm}"
PASSWORD="${CAPTURE_PASSWORD:-password123}"
OUT="src/test/fixtures"

WORK="$(mktemp -d)"
RAW="$WORK/raw"
mkdir -p "$RAW/requests" "$RAW/matching" "$RAW/profile" "$RAW/session"
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

# $1 nom de la session (fichier de cookies distinct par compte)
open_session() {
  JAR="$WORK/$1.cookies"
  curl -s -c "$JAR" -b "$JAR" "${headers[@]}" -o /dev/null "$API/sanctum/csrf-cookie"
}

# $1 méthode, $2 chemin, $3 fichier (relatif au dossier brut), $4 statut attendu, puis arguments curl
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

# $1 adresse, puis arguments facultatifs ; renvoie le statut HTTP de la connexion
try_login() {
  curl -s -c "$JAR" -b "$JAR" "${headers[@]}" "${json[@]}" -H "X-XSRF-TOKEN: $(xsrf)" -X POST \
    -o "$RAW/session/login.json" -w '%{http_code}' \
    -d "{\"email\":\"$1\",\"password\":\"$PASSWORD\"}" "$API/api/v1/auth/login"
}

photo="$WORK/photo.png"
python3 -c 'import base64, sys; open(sys.argv[1], "wb").write(base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="))' "$photo"

# --- Technicien : identifiant du compte de capture ---
open_session technician
[[ "$(try_login "$TECH_EMAIL")" == "200" ]] || { echo "connexion technicien impossible" >&2; exit 1; }
call GET /auth/me session/technician-me.json 200
TECH="$(field "$RAW/session/technician-me.json" user id)"

# --- Client : catalogue, création de deux demandes, rapprochement, propositions ---
open_session client
if [[ "$(try_login "$CLIENT_EMAIL")" != "200" ]]; then
  call POST /auth/register session/register.json 201 "${json[@]}" \
    -d "{\"name\":\"Client Capture\",\"email\":\"$CLIENT_EMAIL\",\"password\":\"$PASSWORD\",\"password_confirmation\":\"$PASSWORD\",\"role\":\"client\"}"
fi

call GET /skills profile/skills.json 200
call POST /requests requests/request-validation-error.json 422 -F "title="
call POST /requests requests/request-created.json 201 \
  -F "title=Panne de courant" \
  -F "description=Plus de courant dans la cuisine depuis ce matin, le disjoncteur saute." \
  -F "category_slug=depannage-electrique" -F "latitude=3.8480" -F "longitude=11.5021" \
  -F "address_label=Rue de la capture, Yaoundé" -F "city=Yaoundé" \
  -F "photos[0]=@$photo;type=image/png"
FIRST="$(field "$RAW/requests/request-created.json" data id)"
call POST /requests session/second-request.json 201 \
  -F "title=Prise murale" \
  -F "description=Une prise murale du salon ne fonctionne plus depuis hier soir." \
  -F "category_slug=depannage-electrique" -F "latitude=3.8480" -F "longitude=11.5021" \
  -F "city=Yaoundé"
SECOND="$(field "$RAW/session/second-request.json" data id)"

call POST "/requests/$FIRST/match" matching/match-results.json 200
call GET "/technicians/$TECH/profile" matching/technician-profile.json 200
call POST "/requests/$FIRST/select-technician" matching/select-validation-error.json 422 "${json[@]}" -d '{}'
call POST "/requests/$FIRST/select-technician" matching/proposal-sent.json 201 "${json[@]}" \
  -d "{\"technician_id\":\"$TECH\",\"price\":15000,\"message\":\"Pouvez-vous passer cet après-midi ?\"}"
call POST "/requests/$SECOND/match" session/second-match.json 200
call POST "/requests/$SECOND/select-technician" session/second-proposal.json 201 "${json[@]}" \
  -d "{\"technician_id\":\"$TECH\",\"price\":12000}"
FIRST_PROPOSAL="$(field "$RAW/matching/proposal-sent.json" data id)"
SECOND_PROPOSAL="$(field "$RAW/session/second-proposal.json" data id)"

# --- Technicien : propositions reçues, refus, acceptation, mission en cours ---
JAR="$WORK/technician.cookies"
call GET /proposals/my matching/proposals.json 200
call POST "/proposals/$FIRST_PROPOSAL/refuse" matching/proposal-refused.json 200
call POST "/proposals/$SECOND_PROPOSAL/accept" matching/proposal-accepted.json 200
call GET /proposals/active-mission matching/active-mission.json 200
call POST /auth/logout session/technician-logout.json 200

# --- Client : état final des demandes ---
JAR="$WORK/client.cookies"
call GET /requests requests/requests.json 200
call GET "/requests/$FIRST" requests/request-detail.json 200
call POST /auth/logout session/client-logout.json 200

python3 scripts/anonymize-fixtures.py "$RAW/profile" "$OUT/profile"
python3 scripts/anonymize-fixtures.py "$RAW/requests" "$OUT/requests"
python3 scripts/anonymize-fixtures.py "$RAW/matching" "$OUT/matching"
