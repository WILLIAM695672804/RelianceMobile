# Refonte « Clean Lavender » de l'interface mobile — spécification

- Date : 15/11/2026
- Statut : validée le 15/11/2026 (épreuve sur téléphone à chaque lot ajoutée à la relecture)
- Source graphique : projet Claude Design « mobile reliance », page `Reliance Mobile.html`
  (48 écrans, système Clean Lavender), exporté le 13/11/2026

## 1. Objet et périmètre

Réécrire **toute l'interface** de RelianceMobile d'après les nouveaux designs, la tester sur
données capturées, puis la reconnecter au serveur et la recetter. L'ancienne interface et le code
devenu inutile sont supprimés.

| Conservé tel quel                                                                                           | Refondu                              | Supprimé                                                   |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------- |
| `src/core/` sauf `theme` (session Sanctum, HTTP, CSRF, temps réel, hors ligne, erreurs, i18n, `responsive`) | `src/core/theme`                     | `src/features/*/screens`, `src/features/*/components`      |
| `src/features/*/api`, `schemas`, `hooks`                                                                    | `src/shared/components`              | écrans de `src/bootstrap/screens` remplacés                |
| `modules/reliance-cookies`, outillage, configuration Expo                                                   | `app/` (routes), navigation par rôle | inscription mobile (`RegisterScreen`, appel, schéma, hook) |
| fixtures capturées et anonymisées                                                                           |                                      | polices Bricolage Grotesque et Inter                       |

Les designs remplacent le contenu de `design/maquettes/` : l'export Clean Lavender y devient la
référence versionnée.

## 2. Décisions

1. **Interface seule** : la couche d'accès aux données, déjà validée contre le serveur, est conservée.
2. **Écrans sans API** (carte hors MapLibre, affectation d'une mission par l'agence, code SMS du
   portefeuille, annulation d'une demande par le client, classement de quartier) : réalisés et testés
   en phase 1 ; masqués de la navigation en phase 2 tant que le serveur ne les sert pas, et consignés.
3. **Fidèle et adaptatif** : reproduction des designs sur la classe `medium` (390 dp), contenu centré
   au-delà de 600 dp, thème sombre fourni par les designs, rotation permise, conventions Android
   (retour système, barre d'état native, aucune barre d'état dessinée). Cibles tactiles ≥ 48 dp,
   y compris là où la maquette dessine 40 px.
4. **Carte** : `@maplibre/maplibre-react-native` avec le style OpenFreeMap
   `https://tiles.openfreemap.org/styles/liberty`, sans clé, comme le frontend web (`maplibre-gl`).
   Les techniciens viennent de l'annuaire existant (`GET /technicians`, filtre de proximité).
   Compatibilité avec React Native 0.86 et la nouvelle architecture vérifiée en premier ; à défaut,
   repli sur la liste « autour de moi ».
5. **Inscription** : redirigée vers le frontend web. « Créer un compte » ouvre
   `${EXPO_PUBLIC_WEB_URL}/inscription/<client|technicien|agence>` selon le rôle choisi ; l'utilisateur
   revient se connecter dans l'application. Le mot de passe oublié reste natif.
6. **Fonctions sans maquette** (≈ 20, toutes servies par le serveur — voir § 6) : réécrites dans le
   style Clean Lavender en prenant les écrans et composants actuels pour base fonctionnelle (champs,
   états, enchaînements, validation), chacune dans le lot de son domaine.

## 3. Architecture

### 3.1 Couches d'une feature

```
src/features/<x>/
  api/  schemas/  hooks/     conservés
  ui/                        écrans de présentation purs (phase 1)
  containers/                branchement sur les hooks (phase 2)
  index.ts
```

Un écran de présentation (`ClientHomeView`) ne connaît ni TanStack Query, ni Axios, ni Expo Router :
il reçoit ses données, un `status` (`loading` | `empty` | `error` | `ready`), un message d'erreur déjà
traduit et ses rappels (`onNewRequest`, `onSubmit`…). Ses propriétés sont typées sur les types
inférés des schémas Zod existants. La règle `import/no-restricted-paths` est étendue : `ui/`
n'importe ni `hooks/`, ni `api/`, ni `expo-router`.

### 3.2 Socle visuel

- **Jetons** : palettes claire et sombre reprises à l'identique de `design-system.jsx`
  (fond `#ffffff`, texte `#17161f`, secondaire `#57556a`, filet `#ececf1`, primaire `#5f3add`,
  `primaryFixed` `#efeaff`, `onPrimaryFixed` `#4918c8` ; accents ambre `#825100`, vert `#006c49`,
  erreur `#ba1a1a` ; variantes sombres correspondantes). Arrondis 8, 10, 12, 14, 20 (carte),
  28 (feuille), pilule. Ombres carte, barre de navigation, feuille.
- **Typographie** : Plus Jakarta Sans 400, 500, 600, 700 (`@expo-google-fonts/plus-jakarta-sans`).
- **Primitives** (`src/shared/components`) : `Button` (primary, soft, ghost ; sm, md, lg),
  `Card`, `Pill`, `Field`, `Avatar`, `ImagePlaceholder`, `Section`, `Icon` (jeu de tracés des
  maquettes en `react-native-svg`), `TabBar` (pilule flottante, onglet actif sur pastille),
  `FAB`, `EmptyState`, `Snackbar`, `Screen` (gouttière et largeur maximale de `core/responsive`).
- **Navigation** : client « Accueil, Carte, Messages, Wallet, Profil » avec FAB « nouvelle
  demande » ; technicien « Missions, Carte, Messages, Gains, Profil » ; agence : écrans atteints
  depuis son tableau de bord. Gardes de session (`computeGuards`) conservés.
- **Correctif** : `app.config.ts` passe à `orientation: 'default'` (il écrasait l'`app.json`).

## 4. Flux de données et erreurs

Route `app/` → conteneur → hooks existants → écran de présentation ; les mutations remontent par
rappels que le conteneur relaie aux hooks. `AppError` est conservé ; les 422 sont reportées sous
les champs (`applyServerErrors`) ; réseau : bandeau hors ligne et état `error` avec « Réessayer » ;
401 : retour à la connexion ; 402 (solde insuffisant), e-mail non vérifié et limitation de débit
gardent leur traitement actuel, redessiné.

## 5. Découpage

Chaque lot fait l'objet d'un plan numéroté (à partir du plan 15) dans
`PROJECTPROF7/docs/superpowers/plans/`, d'une branche `feature/<sujet>` et d'une fusion `--no-ff`
dans `develop`. Aucun `push`.

**L0 — Préalable** : commit de la documentation en suspens et fusion de
`feature/transposition-complete` ; remplacement de `design/maquettes/` par l'export Clean Lavender.

### Phase 1 — Interface sur fixtures

| Lot                     | Écrans des maquettes                                                                                                                  | Écrans sans maquette déclinés                                                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L1 Socle visuel         | — (jetons, police, primitives, icônes, navigation, catalogue `/dev/catalogue` hors production)                                        | —                                                                                                                                                                           |
| L2 Accès et système     | Onboarding, Choix du rôle, Connexion, Notifications, Recherche, États vides, Toasts                                                   | mot de passe oublié, double authentification, réglages des notifications, réglages, espace réservé au web                                                                   |
| L3 Client               | Accueil client, Carte, Nouvelle demande, Matching, Profil technicien                                                                  | liste et détail des demandes, annuaire, adresses                                                                                                                            |
| L4 Intervention         | Suivi, Chat, Inbox, Diagnostic (client, rédaction), Devis, Validation, Libération du séquestre, Facture, Notation, Litige, Annulation | devis reçus, liste et fil des litiges, factures, rapport d'intervention, mes avis, confirmation de paiement                                                                 |
| L5 Technicien           | Accueil technicien, Profil, KYC (×5), Onboarding technicien, Calendrier, Congés, Disponibilités                                       | missions (liste, détail), proposition, statistiques, compétences, zone, créneaux, exceptions, rendez-vous, modification du profil, mot de passe, passage au rôle technicien |
| L6 Finances             | Portefeuille, Recharger, Retirer, Code SMS, Détail d'une transaction                                                                  | —                                                                                                                                                                           |
| L7 Communauté et agence | Fil, Créer un post, Post, Réputation, Badge, Classement, Tableau de bord agence, Équipe, Affecter une mission                         | membre d'équipe                                                                                                                                                             |

### Phase 2 — Reconnexion

| Lot      | Contenu                                                                                                                     |
| -------- | --------------------------------------------------------------------------------------------------------------------------- |
| R1 Coque | navigation par rôle, routes `app/` réécrites, `EXPO_PUBLIC_WEB_URL` et redirection d'inscription                            |
| R2 à R7  | pour L2 à L7 : conteneurs, suppression de l'ancien code du domaine, masquage des écrans sans API, recette contre le serveur |
| R-Carte  | MapLibre : vérification de compatibilité, intégration, repli éventuel                                                       |

## 6. Prise en charge serveur

Recensement du 15/11/2026 : les 118 appels de la couche `api/` mobile correspondent tous à une
route `api/v1` du serveur (219 routes). Fonctions sans maquette et routes : inscription
(`auth/register`, conservée côté web), mot de passe oublié et réinitialisation, `auth/profile`,
`auth/profile/password`, `auth/profile/avatar`, `auth/2fa/*`, `locations`, `notification-settings`,
`requests`, `requests/{id}/quotes`, `jobs` (`tracking`, `phases`, `status`), `proposals/{id}/*`,
`technician/stats`, `skills`, `technician/skills`, `technician/profile`, `technician/time-slots`,
`technician/exceptions`, `appointments`, `reviews/mine`, `disputes`, `technicians`,
`payments/{id}/confirm`, `auth/request-upgrade`, `my-agency`, `agencies/{id}/members`.
Ce recensement établit l'existence des routes et la concordance des méthodes, pas leur
comportement, déjà éprouvé par les fixtures capturées.

Le serveur WebSocket est Laravel Reverb depuis le 13/11/2026 (port 6001) : la recette du temps
réel le vise, Echo restant configuré avec le pilote `pusher`.

## 7. Tests et critères d'achèvement

- **Phase 1** : par écran, rendu d'une fixture réelle, états vide, chargement et erreur, rappels
  déclenchés, cibles ≥ 48 dp, thèmes clair et sombre. Délai des tests d'écran porté à 15 s.
- **Phase 2** : conteneurs testés avec `axios-mock-adapter` et les fixtures ; recette de bout en
  bout de chaque lot R sur la development build contre le serveur local (port 8010, base
  `reliance_test`, comptes de test client, technicien, agence), en consignant ce qui a été vérifié
  et ce qui ne l'a pas été ; redirection d'inscription vérifiée sur appareil.
- **Sur téléphone, à chaque avancement** : chaque lot (L comme R) s'achève par une épreuve sur
  le téléphone Android physique raccordé en USB (`adb`). La development build est recompilée et
  réinstallée dès qu'une dépendance native change (police, `react-native-svg`, MapLibre), sinon
  Metro recharge le JavaScript. En phase 1, chaque écran du lot est ouvert depuis le catalogue
  `/dev/catalogue`, en thème clair puis sombre, en portrait puis paysage, et capturé
  (`adb exec-out screencap`) ; les captures sont rapprochées des maquettes et les écarts corrigés
  avant fusion. En phase 2, la recette de bout en bout se fait sur ce même téléphone, joint au
  serveur par `adb reverse tcp:8010` et `tcp:6001`. Le journal du plan consigne, pour chaque
  écran, ce qui a été vu sur l'appareil et ce qui ne l'a pas été.
- **Toujours** : `tsc`, ESLint et Prettier verts ; couverture ≥ 90 % des lignes et 75 % des
  branches ; aucun import de l'ancienne interface après le lot R correspondant ; aucune dépendance
  inutilisée.
- **Achèvement** : les 48 écrans et les fonctions sans maquette sont servis par la nouvelle
  interface ; plus aucun fichier de l'ancienne interface ; écarts consignés dans une ADR 0011.
