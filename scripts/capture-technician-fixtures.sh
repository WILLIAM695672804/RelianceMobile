#!/usr/bin/env bash
# Capture les réponses réelles du volet technicien du profil et de l'annuaire public.
# Prérequis : `php artisan serve --port=8010` et `php artisan websockets:serve`.
# Effets de bord : présentation, zone d'intervention et compétences du technicien de test modifiées.
set -euo pipefail

API="${API_URL:-http://127.0.0.1:8010}"
ORIGIN="${STATEFUL_ORIGIN:-http://127.0.0.1:5173}"
TECH_EMAIL="${CAPTURE_TECH_EMAIL:-tech.electricien@reliance.cm}"
PASSWORD="${CAPTURE_PASSWORD:-password123}"
OUT="src/test/fixtures"

WORK="$(mktemp -d)"
RAW="$WORK/raw"
mkdir -p "$RAW/technician" "$RAW/directory" "$RAW/session"
trap 'rm -rf "$WORK"' EXIT

JAR="$WORK/technician.cookies"
headers=(-H "Origin: $ORIGIN" -H "Referer: $ORIGIN/" -H "Accept: application/json" -H "X-Requested-With: XMLHttpRequest")
json=(-H "Content-Type: application/json")

xsrf() {
  python3 -c 'import sys, urllib.parse; print(urllib.parse.unquote(sys.argv[1]))' \
    "$(awk '$6 == "XSRF-TOKEN" { print $7 }' "$JAR" | tail -n 1)"
}

field() {
  python3 -c 'import json, sys; data = json.load(open(sys.argv[1])); [data := data[int(k)] if k.isdigit() else data[k] for k in sys.argv[2:]]; print(data)' "$@"
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

curl -s -c "$JAR" -b "$JAR" "${headers[@]}" -o /dev/null "$API/sanctum/csrf-cookie"
call POST /auth/login session/login.json 200 "${json[@]}" \
  -d "{\"email\":\"$TECH_EMAIL\",\"password\":\"$PASSWORD\"}"

# --- Annuaire public (avant toute écriture) ---
call GET /technicians directory/technicians.json 200
call GET "/technicians?search=Electricien" directory/technicians-search.json 200
call GET "/technicians?latitude=3.8480&longitude=11.5021&radius_km=50" directory/technicians-nearby.json 200
call GET "/technicians?skill=inexistant" directory/technicians-empty.json 200

# --- Profil professionnel, compétences et statistiques ---
call GET /technician/profile technician/identity.json 200
call GET /technician/skills technician/skills.json 200
call GET /technician/stats technician/stats.json 200

call PUT /technician/profile technician/identity-updated.json 200 "${json[@]}" \
  -d '{"bio":"Électricien certifié, huit ans d’expérience en installations résidentielles.","competences":["Mise aux normes","Tableaux électriques"]}'
call PUT /technician/location technician/location-validation-error.json 422 "${json[@]}" -d '{}'
call PUT /technician/location technician/location-updated.json 200 "${json[@]}" \
  -d '{"latitude":3.8480,"longitude":11.5021,"address":"Quartier de démonstration","city":"Yaoundé","radius":25,"zones":["Bastos","Nlongkak"]}'

call POST /technician/skills technician/skill-validation-error.json 422 "${json[@]}" -d '{}'
SKILL="$(field "$RAW/directory/technicians.json" data 0 skills 0 id)"
call POST /technician/skills technician/skill-added.json 200 "${json[@]}" \
  -d "{\"skill_id\":\"$SKILL\",\"proficiency\":4,\"experience_years\":8,\"hourly_rate\":7500,\"travel_fee\":1000}"
call DELETE "/technician/skills/$SKILL" technician/skill-removed.json 200
# Rétablissement de la compétence retirée, dans son état capturé.
call POST /technician/skills session/skill-restored.json 200 "${json[@]}" \
  -d "{\"skill_id\":\"$SKILL\",\"proficiency\":3,\"experience_years\":8,\"hourly_rate\":7000,\"travel_fee\":1000}"

call POST /auth/logout session/logout.json 200

python3 scripts/anonymize-fixtures.py "$RAW/technician" "$OUT/technician"
python3 scripts/anonymize-fixtures.py "$RAW/directory" "$OUT/directory"
