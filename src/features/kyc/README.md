# Feature `kyc`

Justificatifs d'identité du technicien.

## Périmètre

| Écran                    | Composant   | Route                  |
| ------------------------ | ----------- | ---------------------- |
| Justificatifs d'identité | `KycScreen` | `app/(profil)/kyc.tsx` |

Justificatifs suivis (alignés sur la page web) : `cni`, `casier`, `cert`, `photo`. Pour chaque type, le document le plus récent fait foi (`buildKycOverview`) ; un statut absent ou inconnu est présenté comme « en cours de vérification ». L'envoi est proposé pour une pièce manquante ou refusée.

## Endpoints

| Fonction           | Méthode et route                                       | Hook                   |
| ------------------ | ------------------------------------------------------ | ---------------------- |
| `fetchMyDocuments` | `GET /auth/kyc/mine`                                   | `useKycDocuments`      |
| `uploadDocument`   | `POST /auth/kyc/upload` (multipart `type`, `document`) | `useUploadKycDocument` |

## Canaux temps réel

`user.{id}` → `KycStatusChanged` : invalidation des justificatifs (`useKycStatusSync`, monté dans `src/bootstrap/RealtimeBridge.tsx`).

## Fixtures

`src/test/fixtures/kyc/` — `kyc-uploaded.json` et `kyc-mine.json` capturés par `./scripts/capture-profile-fixtures.sh` (ajoute un document `cni` en attente au compte de test) ; `kyc-status-changed.json` rédigé d'après `KycStatusChanged::broadcastWith`.

## Limites connues

- Seules les images (galerie ou appareil photo) sont proposées ; le backend accepte aussi le PDF.
- `document.status` peut valoir `null` dans la réponse d'envoi (modèle non relu après création).
