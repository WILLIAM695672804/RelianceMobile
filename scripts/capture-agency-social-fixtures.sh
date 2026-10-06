#!/usr/bin/env bash
# Capture les réponses réelles de l'espace agence et du fil social.
# Prérequis : `php artisan serve --port=8010` et `php artisan websockets:serve`.
# Effets de bord : un compte agence de démonstration est créé au besoin, avec son agence
# et le technicien de test comme membre ; deux publications et un commentaire sont ajoutés.
set -euo pipefail

API="${API_URL:-http://127.0.0.1:8010}"
ORIGIN="${STATEFUL_ORIGIN:-http://127.0.0.1:5173}"
TECH_EMAIL="${CAPTURE_TECH_EMAIL:-tech.electricien@reliance.cm}"
CLIENT_EMAIL="${CAPTURE_CLIENT_EMAIL:-client.capture@example.test}"
AGENCY_EMAIL="${CAPTURE_AGENCY_EMAIL:-agence.capture@example.test}"
PASSWORD="${CAPTURE_PASSWORD:-password123}"
OUT="src/test/fixtures"

WORK="$(mktemp -d)"
RAW="$WORK/raw"
mkdir -p "$RAW/agency" "$RAW/social" "$RAW/session"
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

try_login() {
  curl -s -c "$JAR" -b "$JAR" "${headers[@]}" "${json[@]}" -H "X-XSRF-TOKEN: $(xsrf)" -X POST \
    -o "$RAW/session/login.json" -w '%{http_code}' \
    -d "{\"email\":\"$1\",\"password\":\"$PASSWORD\"}" "$API/api/v1/auth/login"
}

# ── Technicien : identifiant pour l'ajout de membre ──────────────────────
open_session technician
[[ "$(try_login "$TECH_EMAIL")" == "200" ]] || { echo "connexion technicien impossible" >&2; exit 1; }
call GET /auth/me session/technician-me.json 200
TECH="$(field "$RAW/session/technician-me.json" user id)"
call POST /auth/logout session/logout-technician.json 200

# ── Agence : création, membres, mise à jour ──────────────────────────────
open_session agency
if [[ "$(try_login "$AGENCY_EMAIL")" != "200" ]]; then
  call POST /auth/register session/register-agency.json 201 "${json[@]}" \
    -d "{\"name\":\"Agence Capture\",\"email\":\"$AGENCY_EMAIL\",\"password\":\"$PASSWORD\",\"password_confirmation\":\"$PASSWORD\",\"role\":\"agence\",\"agency_name\":\"Agence de démonstration\",\"address\":\"Quartier de démonstration\"}"
fi

call GET /my-agency agency/my-agency-empty.json 200
AGENCY="$(python3 -c "
import json
data = json.load(open('$RAW/agency/my-agency-empty.json')).get('data')
print(data['id'] if data else '')
")"

if [[ -z "$AGENCY" ]]; then
  call POST /agencies agency/agency-validation-error.json 422 "${json[@]}" -d '{}'
  call POST /agencies agency/agency-created.json 201 "${json[@]}" \
    -d '{"name":"Agence de démonstration","description":"Agence de test pour la recette mobile.","address":"Quartier de démonstration","phone":"600000000","email":"contact@example.test"}'
  AGENCY="$(field "$RAW/agency/agency-created.json" data id)"
else
  call POST /agencies agency/agency-validation-error.json 422 "${json[@]}" -d '{}'
fi

call GET /my-agency agency/my-agency.json 200
call GET "/agencies/$AGENCY" agency/agency.json 200
call PUT "/agencies/$AGENCY" agency/agency-updated.json 200 "${json[@]}" \
  -d '{"name":"Agence de démonstration","description":"Agence de test, mise à jour depuis le mobile."}'
call GET "/agencies/$AGENCY/members" agency/members.json 200

MEMBER_STATUS="$(curl -s -c "$JAR" -b "$JAR" "${headers[@]}" "${json[@]}" -H "X-XSRF-TOKEN: $(xsrf)" \
  -X POST -o "$RAW/agency/member-added.json" -w '%{http_code}' \
  -d "{\"user_id\":\"$TECH\",\"role\":\"member\"}" "$API/api/v1/agencies/$AGENCY/members")"
echo "capturé : POST /agencies/{id}/members → $MEMBER_STATUS"

call GET "/agencies/$AGENCY/members" agency/members-with-technician.json 200
call GET /agencies agency/agencies.json 200
call POST /auth/logout session/logout-agency.json 200

# ── Client : fil social ──────────────────────────────────────────────────
open_session client
[[ "$(try_login "$CLIENT_EMAIL")" == "200" ]] || { echo "connexion client impossible" >&2; exit 1; }

call POST /posts social/post-validation-error.json 422 "${json[@]}" -d '{}'
call POST /posts social/post-created.json 201 "${json[@]}" \
  -d '{"content":"Première publication de démonstration sur le fil Reliance."}'
POST_ID="$(field "$RAW/social/post-created.json" data id)"
call POST /posts session/post-second.json 201 "${json[@]}" \
  -d '{"content":"Seconde publication : retour d’expérience après intervention."}'

call GET /posts/feed social/feed.json 200
call GET /posts/explore social/explore.json 200
call GET "/posts/$POST_ID" social/post.json 200
call POST "/posts/$POST_ID/like" social/like-toggled.json 200
call POST "/posts/$POST_ID/comments" social/comment-validation-error.json 422 "${json[@]}" -d '{}'
call POST "/posts/$POST_ID/comments" social/comment-created.json 201 "${json[@]}" \
  -d '{"content":"Merci pour le retour !"}'
call GET "/posts/$POST_ID/comments" social/comments.json 200
call POST /auth/logout session/logout-client.json 200

python3 scripts/anonymize-fixtures.py "$RAW/agency" "$OUT/agency"
python3 scripts/anonymize-fixtures.py "$RAW/social" "$OUT/social"
