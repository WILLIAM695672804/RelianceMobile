# Feature `profile`

Profil de l'utilisateur connecté, commun aux rôles client, technicien et agence.

## Périmètre

| Écran                                     | Composant              | Route                        |
| ----------------------------------------- | ---------------------- | ---------------------------- |
| E08 Profil (onglet « Compte »)            | `ProfileScreen`        | `app/<rôle>/account.tsx`     |
| E09 Modification du profil et de l'avatar | `EditProfileScreen`    | `app/(profil)/edit.tsx`      |
| Mot de passe                              | `ChangePasswordScreen` | `app/(profil)/password.tsx`  |
| Adresses                                  | `LocationsScreen`      | `app/(profil)/locations.tsx` |
| Demande de passage technicien (client)    | `UpgradeRequestScreen` | `app/(profil)/upgrade.tsx`   |
| E26 Paramètres                            | `SettingsScreen`       | `app/(profil)/settings.tsx`  |

Le groupe `app/(profil)` est ouvert par la garde `isMember` ; `upgrade` est réservé au client, `kyc` (feature `kyc`) au technicien.

## Endpoints

| Fonction             | Méthode et route                | Hook                    |
| -------------------- | ------------------------------- | ----------------------- |
| `updateProfile`      | `PUT /auth/profile`             | `useUpdateProfile`      |
| `changePassword`     | `PUT /auth/profile/password`    | `useChangePassword`     |
| `uploadAvatar`       | `POST /auth/profile/avatar`     | `useUploadAvatar`       |
| `fetchLocations`     | `GET /locations`                | `useLocations`          |
| `createLocation`     | `POST /locations`               | `useCreateLocation`     |
| `deleteLocation`     | `DELETE /locations/{id}`        | `useDeleteLocation`     |
| `setDefaultLocation` | `PATCH /locations/{id}/default` | `useSetDefaultLocation` |
| `requestUpgrade`     | `POST /auth/request-upgrade`    | `useRequestUpgrade`     |

E26 réutilise les hooks de `@/features/auth` (`useAccount`, 2FA, `useResendVerification`, `useLogout`).

## Session

Après modification du profil ou de l'avatar, l'utilisateur de session est mis à jour par `signIn` (profil en cache hors ligne compris) et `GET /auth/me` est invalidé. Le rôle est conservé : `PUT /auth/profile` ne renvoie pas les rôles.

## Langue

La langue choisie dans E26 est enregistrée dans le stockage MMKV `reliance.preferences` (`core/i18n/languagePreference.ts`) et prime sur la langue de l'appareil au démarrage ; elle survit à la déconnexion.

## Fixtures

`src/test/fixtures/profile/` — régénération : `./scripts/capture-profile-fixtures.sh` (backend local démarré ; crée puis supprime une adresse). `avatar-updated.json` est rédigée à la main (l'envoi modifierait le compte de test).

## Limites connues

- Le téléphone ne peut pas être effacé : Laravel convertit la chaîne vide en `null`, que la règle `string` refuse.
- La double authentification présente le secret en clair ; le QR code SVG n'est pas rendu.
- La demande de passage technicien n'envoie pas de compétences (catalogue `GET /skills` : Plan 3).
- Compétences, périmètre d'intervention et statistiques du technicien : Plan 3.
