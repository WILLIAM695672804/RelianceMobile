# Feature `auth`

Gabarit de référence des features (voir `docs/guide-developpement.md`, § 3).

## Périmètre

| Écran                                      | Composant              | Route                            |
| ------------------------------------------ | ---------------------- | -------------------------------- |
| E02 Connexion (avec étape 2FA)             | `LoginScreen`          | `app/(auth)/login.tsx`           |
| E03 Inscription client, technicien, agence | `RegisterScreen`       | `app/(auth)/register.tsx`        |
| E04 Mot de passe oublié                    | `ForgotPasswordScreen` | `app/(auth)/forgot-password.tsx` |

La restauration de session (E01), l'expiration et la purge relèvent de `src/core/session/`.

## Endpoints

| Fonction             | Méthode et route                             | Hook                    |
| -------------------- | -------------------------------------------- | ----------------------- |
| `login`              | `POST /auth/login`                           | `useLogin`              |
| `register`           | `POST /auth/register`                        | `useRegister`           |
| — (`core/session`)   | `POST /auth/logout`                          | `useLogout`             |
| `fetchAccount`       | `GET /auth/me`                               | `useAccount`            |
| `forgotPassword`     | `POST /auth/forgot-password`                 | `useForgotPassword`     |
| `resetPassword`      | `POST /auth/reset-password`                  | `useResetPassword`      |
| `resendVerification` | `POST /auth/email/verification-notification` | `useResendVerification` |
| `generateTwoFactor`  | `POST /auth/2fa/generate`                    | `useGenerateTwoFactor`  |
| `enableTwoFactor`    | `POST /auth/2fa/enable`                      | `useEnableTwoFactor`    |
| `disableTwoFactor`   | `POST /auth/2fa/disable`                     | `useDisableTwoFactor`   |

## Canaux temps réel

`user.{id}` → `RoleUpgradeDecision` : relecture de `/auth/me` (abonnement dans `src/bootstrap/RealtimeBridge.tsx`).

## Fixtures

`src/test/fixtures/auth/` — régénération : `./scripts/capture-auth-fixtures.sh` (backend local démarré).

## État d'avancement

- [x] Couche données, hooks, écrans E02 à E04, tests.
- [ ] Écrans de réinitialisation par lien profond et de gestion 2FA : plan ultérieur (hooks déjà disponibles).

## Observations backend

- `POST /auth/forgot-password` valide `exists:users,email` : la réponse 422 révèle l'existence d'un compte (énumération).
- Après inscription, l'adresse n'est pas vérifiée : les routes protégées par `verified` répondent 403 (`emailNotVerified`).
