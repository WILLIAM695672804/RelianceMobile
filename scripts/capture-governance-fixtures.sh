#!/usr/bin/env bash
# Capture les réponses réelles des litiges, du séquestre, des paiements et des interventions.
# Prérequis : `php artisan serve --port=8010`, et une demande clôturée pour le client de test
# (voir capture-finance-fixtures.sh, qui clôture une mission).
# Effets de bord : un litige est ouvert, le portefeuille du client est rechargé puis gelé,
# un gel est capturé au profit du technicien, un autre est libéré, une intervention est
# créée puis clôturée, et trois badges sont insérés en base si le catalogue est vide.
set -euo pipefail

API="${API_URL:-http://127.0.0.1:8010}"
ORIGIN="${STATEFUL_ORIGIN:-http://127.0.0.1:5173}"
BACKEND="${BACKEND_PATH:-../RelianceBackend}"
TECH_EMAIL="${CAPTURE_TECH_EMAIL:-tech.electricien@reliance.cm}"
CLIENT_EMAIL="${CAPTURE_CLIENT_EMAIL:-client.capture@example.test}"
PASSWORD="${CAPTURE_PASSWORD:-password123}"
OUT="src/test/fixtures"

WORK="$(mktemp -d)"
RAW="$WORK/raw"
mkdir -p "$RAW/disputes" "$RAW/interventions" "$RAW/wallet" "$RAW/reviews" "$RAW/session"
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

# Les badges n'ont aucun point d'API de création : ils sont semés en base, comme en production
# où un administrateur les déclare.
seed_badges() {
  (cd "$BACKEND" && php artisan tinker --execute="
use App\Modules\Gamification\Models\Badge;
use App\Modules\Gamification\Models\UserBadge;
\$catalogue = [
  ['code' => 'first-mission', 'title' => 'Première mission', 'description' => 'Première intervention menée à son terme.', 'icon_ref' => 'check'],
  ['code' => 'five-stars', 'title' => 'Cinq étoiles', 'description' => 'Dix avis à cinq étoiles consécutifs.', 'icon_ref' => 'star'],
  ['code' => 'punctual', 'title' => 'Ponctuel', 'description' => 'Vingt interventions sans retard.', 'icon_ref' => 'clock'],
];
foreach (\$catalogue as \$row) { Badge::firstOrCreate(['code' => \$row['code']], \$row); }
\$technician = \App\Models\User::where('email', '$TECH_EMAIL')->first();
if (\$technician) {
  foreach (['first-mission', 'five-stars'] as \$code) {
    \$badge = Badge::where('code', \$code)->first();
    UserBadge::firstOrCreate(
      ['user_id' => \$technician->id, 'badge_id' => \$badge->id],
      ['awarded_at' => now()]
    );
  }
}
echo 'badges semés', PHP_EOL;
") || {
    echo "échec : amorçage des badges" >&2
    exit 1
  }
}

seed_badges

# ── Technicien : identité, mission clôturée et rapport d'intervention ────
open_session technician
login technician "$TECH_EMAIL"
call GET /auth/me session/technician-me.json 200
TECH="$(field "$RAW/session/technician-me.json" user id)"

call GET /jobs session/jobs.json 200
JOB="$(python3 -c '
import json, sys
page = json.load(open(sys.argv[1]))
rows = page["data"]
rows = rows["data"] if isinstance(rows, dict) else rows
completed = [row for row in rows if row.get("status") == "completed"] or rows
job = completed[0]
request = job.get("request") or {}
print(job["id"], request.get("id", ""))
' "$RAW/session/jobs.json")"
REQUEST="${JOB#* }"
JOB="${JOB%% *}"
if [[ -z "$REQUEST" ]]; then
  echo "échec : aucune demande attachée à la mission $JOB" >&2
  exit 1
fi
echo "mission retenue : $JOB (demande $REQUEST)"

call POST /interventions interventions/intervention-validation-error.json 422 "${json[@]}" -d '{}'
call POST /interventions interventions/intervention-created.json 201 "${json[@]}" \
  -d "{\"job_id\":\"$JOB\",\"request_id\":\"$REQUEST\",\"type\":\"standard\",\"description\":\"Remise en état du tableau électrique.\"}"
INTERVENTION="$(field "$RAW/interventions/intervention-created.json" data id)"
call POST "/interventions/$INTERVENTION/start" interventions/intervention-started.json 200 "${json[@]}" -d '{}'
call POST "/interventions/$INTERVENTION/complete" interventions/intervention-completed.json 200 "${json[@]}" \
  -d '{"work_performed":"Remplacement du disjoncteur principal et resserrage des bornes.","materials_used":["Disjoncteur 16 A","Gaine thermorétractable"],"duration_hours":1.5,"notes":"Prévoir le remplacement du tableau sous six mois."}'
call GET /interventions interventions/interventions.json 200
call GET "/interventions/$INTERVENTION" interventions/intervention.json 200
call GET "/badges/user/$TECH" reviews/user-badges.json 200
call POST /auth/logout session/logout-technician.json 200

# ── Client : litige, recharge, paiement et séquestre ─────────────────────
open_session client
login client "$CLIENT_EMAIL"
call GET /auth/me session/client-me.json 200

call POST /disputes disputes/dispute-validation-error.json 422 "${json[@]}" -d '{}'
call POST /disputes disputes/dispute-created.json 201 "${json[@]}" \
  -d "{\"request_id\":\"$REQUEST\",\"against\":\"$TECH\",\"reason\":\"quality\",\"description\":\"La prise installée ne tient pas dans le mur.\"}"
DISPUTE="$(field "$RAW/disputes/dispute-created.json" data id)"
call POST "/disputes/$DISPUTE/message" disputes/dispute-message.json 200 "${json[@]}" \
  -d '{"message":"Voici une photo de la prise descellée."}'
call GET /disputes disputes/disputes.json 200
call GET "/disputes/$DISPUTE" disputes/dispute.json 200

call POST /wallet/recharge wallet/recharge-initiated.json 200 "${json[@]}" \
  -d '{"amount":25000,"method":"bank_transfer"}'
PAYMENT="$(field "$RAW/wallet/recharge-initiated.json" payment_id)"
call GET "/payments/$PAYMENT" wallet/payment.json 200
call POST "/payments/$PAYMENT/confirm" wallet/payment-confirmed.json 200 "${json[@]}" -d '{}'
call GET "/payments/$PAYMENT" wallet/payment-settled.json 200
call POST "/payments/$PAYMENT/confirm" wallet/payment-already-settled.json 409 "${json[@]}" -d '{}'
call GET /wallet/transactions wallet/transactions-credited.json 200

call POST /holds wallet/hold-validation-error.json 422 "${json[@]}" -d '{}'
call POST /holds wallet/hold-created.json 200 "${json[@]}" \
  -d "{\"amount\":15000,\"reason\":\"Séquestre de la demande $REQUEST\"}"
HOLD="$(field "$RAW/wallet/hold-created.json" data id)"
call GET /holds wallet/holds.json 200
call POST "/holds/$HOLD/capture" wallet/hold-captured.json 200 "${json[@]}" \
  -d "{\"payee_id\":\"$TECH\",\"method\":\"momo\"}"

call POST /holds wallet/hold-second.json 200 "${json[@]}" \
  -d '{"amount":5000,"reason":"Séquestre à libérer"}'
SECOND_HOLD="$(field "$RAW/wallet/hold-second.json" data id)"
call POST "/holds/$SECOND_HOLD/release" wallet/hold-released.json 200 "${json[@]}" -d '{}'
call GET /holds wallet/holds-after.json 200
call GET /badges reviews/badges.json 200
call POST /auth/logout session/logout-client.json 200

python3 scripts/anonymize-fixtures.py "$RAW/disputes" "$OUT/disputes"
python3 scripts/anonymize-fixtures.py "$RAW/interventions" "$OUT/interventions"
python3 scripts/anonymize-fixtures.py "$RAW/wallet" "$OUT/wallet"
python3 scripts/anonymize-fixtures.py "$RAW/reviews" "$OUT/reviews"
echo "fixtures écrites"
