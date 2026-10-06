#!/usr/bin/env bash
# Capture les réponses réelles des notifications et de la messagerie.
# Prérequis : `php artisan serve --port=8010` et `php artisan websockets:serve`.
# Effets de bord : deux notifications de démonstration créées pour le client de capture,
# une conversation ouverte entre le client et le technicien de test, deux messages envoyés.
set -euo pipefail

API="${API_URL:-http://127.0.0.1:8010}"
ORIGIN="${STATEFUL_ORIGIN:-http://127.0.0.1:5173}"
BACKEND="${BACKEND_PATH:-/home/william/Documents/PROJECTPROF7/RelianceBackend}"
TECH_EMAIL="${CAPTURE_TECH_EMAIL:-tech.electricien@reliance.cm}"
CLIENT_EMAIL="${CAPTURE_CLIENT_EMAIL:-client.capture@example.test}"
PASSWORD="${CAPTURE_PASSWORD:-password123}"
OUT="src/test/fixtures"

WORK="$(mktemp -d)"
RAW="$WORK/raw"
mkdir -p "$RAW/notifications" "$RAW/chat" "$RAW/session"
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

# Deux notifications de démonstration, pour que la liste ne soit pas vide.
php "$BACKEND/artisan" tinker --execute="
\$client = App\Modules\Auth\Models\User::where('email', '$CLIENT_EMAIL')->firstOrFail();
App\Modules\Notification\Models\Notification::create(['user_id' => \$client->id, 'title' => 'Proposition reçue', 'body' => 'Un technicien vous a transmis une proposition.', 'payload' => ['type' => 'proposal'], 'is_read' => false]);
App\Modules\Notification\Models\Notification::create(['user_id' => \$client->id, 'title' => 'Devis envoyé', 'body' => 'Votre technicien a envoyé un devis.', 'payload' => ['type' => 'quote'], 'is_read' => true, 'read_at' => now()]);
echo 'notifications créées';
" > /dev/null
echo "préparé : deux notifications de démonstration"

# ── Technicien : identifiant pour la conversation ────────────────────────
open_session technician
login technician "$TECH_EMAIL"
call GET /auth/me session/technician-me.json 200
TECH="$(field "$RAW/session/technician-me.json" user id)"

# ── Client : notifications et conversation ───────────────────────────────
open_session client
login client "$CLIENT_EMAIL"

call GET /notifications notifications/notifications.json 200
call GET /notifications/unread-count notifications/unread-count.json 200
NOTIFICATION="$(field "$RAW/notifications/notifications.json" data 0 id)"
call POST "/notifications/$NOTIFICATION/read" notifications/notification-read.json 200
call POST /notifications/read-all notifications/read-all.json 200
call GET /notification-settings notifications/settings.json 200
call PUT /notification-settings notifications/settings-updated.json 200 "${json[@]}" \
  -d '{"in_app":true,"push":false,"email":true,"sms":false}'

call POST /conversations chat/conversation-validation-error.json 422 "${json[@]}" -d '{}'
call POST /conversations chat/conversation-created.json 201 "${json[@]}" \
  -d "{\"members\":[\"$TECH\"],\"subject\":\"Intervention électrique\",\"initial_message\":\"Bonjour, à quelle heure passez-vous ?\"}"
CONVERSATION="$(field "$RAW/chat/conversation-created.json" data id)"

call POST "/conversations/$CONVERSATION/messages" chat/message-validation-error.json 422 "${json[@]}" -d '{}'
call POST "/conversations/$CONVERSATION/messages" chat/message-created.json 201 "${json[@]}" \
  -d '{"body":"Je serai présent toute la matinée."}'
call GET /conversations chat/conversations.json 200
call GET "/conversations/$CONVERSATION" chat/conversation.json 200
call GET "/conversations/$CONVERSATION/messages" chat/messages.json 200
call GET /conversations/unread-count chat/unread-count.json 200
call POST "/conversations/$CONVERSATION/messages/read" chat/messages-read.json 200
call GET "/conversations/$CONVERSATION/messages/attachments" chat/attachments.json 200
call POST /auth/logout session/logout-client.json 200

# ── Technicien : la conversation vue de l'autre côté ─────────────────────
JAR="$WORK/technician.cookies"
call GET /conversations chat/conversations-technician.json 200
call POST "/conversations/$CONVERSATION/messages" session/message-technician.json 201 "${json[@]}" \
  -d '{"body":"Bonjour, je passe vers 9 h."}'
call POST /auth/logout session/logout-technician.json 200

python3 scripts/anonymize-fixtures.py "$RAW/notifications" "$OUT/notifications"
python3 scripts/anonymize-fixtures.py "$RAW/chat" "$OUT/chat"
