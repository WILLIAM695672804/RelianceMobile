# ADR 0010 — Transposition complète des maquettes et jointure des écrans

- Statut : acceptée (17/10/2026)

## Contexte

L'ADR 0009 avait porté les jetons, l'iconographie et l'adaptativité des maquettes, mais le
recensement du 17/10/2026 a établi que, sur les 48 écrans de `design/maquettes/`, 32 seulement
étaient transposés, 2 l'étaient partiellement et 14 restaient sans correspondance. Ce même
recensement a montré que la cause avancée par l'ADR 0009 — des fonctions « hors périmètre » —
était fautive : le serveur expose les litiges (`/disputes`), le séquestre (`/holds`), la
réputation et les badges (`/reputation/{id}`, `/badges`), ainsi que les interventions
(`/interventions`), que l'application n'appelait pas.

Le graphe de navigation des maquettes (`design/maquettes/app.jsx`) décrit par ailleurs des
arêtes que l'application n'offrait pas, au premier rang desquelles la chaîne
`intervention → validation → escrow-release → rating → invoice`.

## Décision

1. **Transposer les quatorze maquettes atteignables**, dans deux tranches nouvelles
   (`interventions`, `disputes`) et dans les tranches existantes (`wallet`, `missions`,
   `reviews`, `directory`, `auth`, `profile`).
2. **Matérialiser les arêtes du graphe** dans `src/bootstrap/screens`, chaque route d'`app/`
   se bornant à déléguer. Vingt arêtes sont éprouvées par `joins.test.tsx`.
3. **Ne rien feindre** : lorsque l'API ne permet pas ce que la maquette montre, l'écart est
   assumé et consigné plutôt que simulé.

## Conséquences

### Écarts assumés

| Maquette                  | Écart                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------ |
| `CancelScreen`            | transposée côté technicien : `PATCH /jobs/{id}/status` n'accepte que le technicien assigné |
| `WalletOTPScreen`         | aucune saisie de code : `POST /payments/{id}/confirm` ne vérifie aucun secret              |
| `LeaderboardScreen`       | classement par note reçue, aucun point d'API ne publiant de palmarès de réputation         |
| `TransactionDetailScreen` | détail relu dans la liste en cache, aucun point d'API unitaire n'existant                  |
| `TechOnboardingScreen`    | parcours d'avancement et non assistant : les cinq écrans restent utilisables séparément    |
| `ValidationScreen`        | fondue dans le contrôle qualité, dont la validation capture le séquestre                   |
| `EscrowReleaseScreen`     | panneau de réussite du contrôle qualité, menant au dépôt d'un avis                         |
| `ToastsScreen`            | catalogue devenu le composant `Snackbar`, employé par les parcours ajoutés                 |

### Hors d'atteinte

- `MapScreen` : aucune bibliothèque de cartographie n'est installée, et `expo-maps` comme
  `react-native-maps` exigent une clé Google Maps pour Android. La fonction — trouver un
  technicien à proximité — reste servie par le filtre « autour de moi » de l'annuaire.
- `AssignJobScreen` : l'affectation d'une mission n'existe qu'en
  `POST /admin/requests/{id}/assign`, réservé à l'administration ; le rôle agence ne peut y
  prétendre.
- L'annulation d'une demande **par le client** exige un point d'API absent.

### Correctif serveur

`GET /interventions` ne filtrait que pour les techniciens : tout autre utilisateur recevait les
interventions de l'ensemble des clients, rapports et observations compris, et
`GET /interventions/{id}` n'opposait aucune autorisation. Le correctif
`fix(operations): restreint les interventions à leurs deux parties` restreint les deux routes
aux parties de la mission, l'administration exceptée. Sans lui, le client n'avait d'ailleurs
aucun moyen légitime d'atteindre le rapport, le serveur ne publiant l'identifiant d'intervention
nulle part.

### Autres conséquences

- Les badges n'avaient jamais été semés : les fixtures du catalogue et des attributions étaient
  vides, et trois tests entérinaient ce vide. Le script de capture sème trois badges et en
  attribue deux.
- Le séquestre n'est rattaché à aucune demande côté serveur : `holdForRequest` retrouve le gel
  par son motif, à défaut le plus ancien encore actif.
- `clientActiveMission` ne renvoie que les demandes `quoted` ou `assigned` : une fois la mission
  terminée, le suivi client n'a plus de mission active. La fin de parcours — contrôle qualité,
  avis, litige — est donc accrochée au détail de la demande, qui subsiste.
- L'historique des recherches et le drapeau du fil d'accueil vivent dans le stockage des
  préférences : ils survivent à la déconnexion et ne quittent jamais l'appareil.

## Voir aussi

- [ADR 0009 — Habillage Android adaptatif](./0009-habillage-android-adaptatif.md)
- [ADR 0005 — Design system maison](./0005-design-system-maison.md)
