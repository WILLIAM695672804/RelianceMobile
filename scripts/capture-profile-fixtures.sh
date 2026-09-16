#!/usr/bin/env bash
# Capture les réponses réelles des routes profil et KYC du backend local (compte technicien des seeders).
# Effets de bord sur la base locale : une adresse créée puis supprimée ; un document KYC « cni » en attente ajouté.
set -euo pipefail

API="${API_URL:-http://127.0.0.1:8010}"
ORIGIN="${STATEFUL_ORIGIN:-http://127.0.0.1:5173}"
EMAIL="${CAPTURE_EMAIL:-tech.electricien@reliance.cm}"
PASSWORD="${CAPTURE_PASSWORD:-password123}"
OUT="src/test/fixtures"

WORK="$(mktemp -d)"
JAR="$WORK/cookies.txt"
RAW="$WORK/raw"
mkdir -p "$RAW/profile" "$RAW/kyc"
trap 'rm -rf "$WORK"' EXIT

common=(-s -c "$JAR" -b "$JAR" -H "Origin: $ORIGIN" -H "Referer: $ORIGIN/" -H "Accept: application/json" -H "X-Requested-With: XMLHttpRequest")
json=(-H "Content-Type: application/json")

xsrf() {
  python3 -c 'import sys, urllib.parse; print(urllib.parse.unquote(sys.argv[1]))' \
    "$(awk '$6 == "XSRF-TOKEN" { print $7 }' "$JAR" | tail -n 1)"
}

field() {
  python3 -c 'import json, sys; data = json.load(open(sys.argv[1])); [data := data[k] for k in sys.argv[2:]]; print(data)' "$@"
}

# $1 méthode, $2 chemin, $3 fichier (relatif au dossier brut), $4 statut attendu, puis arguments curl supplémentaires
call() {
  local method="$1" path="$2" file="$3" expected="$4"
  shift 4
  local args=("${common[@]}" -X "$method" -o "$RAW/$file" -w '%{http_code}')
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

curl "${common[@]}" -o /dev/null "$API/sanctum/csrf-cookie"
call POST /auth/login login.json 200 "${json[@]}" -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"

# Profil : écriture idempotente (nom inchangé) et erreurs attendues.
NAME="$(field "$RAW/login.json" user name)"
call PUT /auth/profile profile/profile-updated.json 200 "${json[@]}" -d "{\"name\":\"$NAME\"}"
call PUT /auth/profile/password profile/password-invalid.json 400 "${json[@]}" \
  -d '{"current_password":"mot-de-passe-errone","new_password":"nouveau-mdp-1","new_password_confirmation":"nouveau-mdp-1"}'
call PUT /auth/profile/password profile/password-validation-error.json 422 "${json[@]}" -d '{}'

# Adresses : création, liste, suppression (état final identique à l'état initial).
call POST /locations profile/location-created.json 201 "${json[@]}" \
  -d '{"label":"Capture","address":"Rue de la capture","city":"Douala","is_default":false}'
LOCATION_ID="$(field "$RAW/profile/location-created.json" location id)"
call GET /locations profile/locations.json 200
call DELETE "/locations/$LOCATION_ID" profile/location-deleted.json 200

# Passage technicien : le compte de capture est déjà technicien (422 métier).
call POST /auth/request-upgrade profile/upgrade-already-technician.json 422 "${json[@]}" \
  -d '{"motivation":"Capture de contrat : ce compte est déjà technicien."}'

# KYC : envoi d'une image PNG d'un pixel, puis relecture.
python3 -c 'import base64, sys; open(sys.argv[1], "wb").write(base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="))' "$WORK/document.png"
call POST /auth/kyc/upload kyc/kyc-uploaded.json 200 -F "type=cni" -F "document=@$WORK/document.png;type=image/png"
call GET /auth/kyc/mine kyc/kyc-mine.json 200

call POST /auth/logout logout.json 200

python3 scripts/anonymize-fixtures.py "$RAW/profile" "$OUT/profile"
python3 scripts/anonymize-fixtures.py "$RAW/kyc" "$OUT/kyc"
