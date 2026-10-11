# ADR 0009 — Habillage Android adaptatif

- Statut : acceptée (11/10/2026)

## Contexte

L'ADR 0005 n'avait retenu des maquettes (`design/maquettes/`) que leurs jetons : couleurs,
rayons et polices. Les 48 écrans de maquette n'avaient jamais été transposés. L'application
livrée aux Plans 1 à 12 n'employait donc aucune icône (zéro occurrence dans `src/` et `app/`),
ses barres d'onglets n'affichaient que du texte, aucun écran n'avait de grille, de carte à
icône ni de barre de recherche, et aucun module ne tenait compte de la largeur de l'écran.
Les maquettes sont par ailleurs des prototypes web (`<div>`, `<input>`, styles CSS) cadrés
iOS (`ios-frame.jsx`) : rien n'y est transposable tel quel.

## Décision

1. **Iconographie** — les 53 icônes de `design-system.jsx` sont portées à l'identique en
   `react-native-svg`, leurs tracés étant extraits automatiquement des maquettes. Aucune
   bibliothèque d'icônes tierce, conformément à l'ADR 0005.
2. **Conventions Android** — l'interaction suit Material 3 : barre supérieure à titre aligné
   à gauche (et non centré comme en iOS), onde de pression sur tout élément pressable, cible
   tactile d'au moins 48 dp, barre de navigation basse à icônes. Les rayons et la palette
   restent ceux des maquettes.
3. **Adaptativité** — le module `core/responsive` expose quatre classes de taille de fenêtre
   (`compact` < 360 dp, `medium`, `expanded` ≥ 600 dp, `large` ≥ 840 dp), la gouttière, le
   nombre de colonnes et l'échelle typographique. Les écrans n'écrivent plus aucune dimension
   en dur : les espacements viennent du thème, les colonnes d'`AdaptiveGrid`.
4. **Accessibilité** — la mise à l'échelle du texte demandée par le système est honorée
   jusqu'à un facteur de 1,4, au-delà duquel les mises en page se romperaient.

## Conséquences

- `react-native-svg` est un module natif : toute recette appareil exige `npx expo run:android`.
- `app.json` passe à `userInterfaceStyle: "automatic"` et `orientation: "default"` ; la palette
  sombre, présente depuis le Plan 1 mais inatteignable, devient active, et la rotation en
  paysage est permise. Ces deux réglages touchent le manifeste natif.
- Les tests s'exécutent sur un gabarit de téléphone Android (412 × 915) imposé par
  `jest.setup.ts` : la fenêtre par défaut de jest-expo mesure 750 points et plaçait tous les
  écrans dans la classe `expanded`.
- Treize maquettes restent sans correspondance, décrivant des fonctions hors périmètre
  (litiges, séquestre, classement, parcours d'accueil) ou n'étant pas des écrans (catalogues
  d'états vides et de bandeaux). `MapScreen` reste hors d'atteinte faute de bibliothèque de
  cartographie.
- L'onde de pression n'est pas observable sous Jest (`android_ripple` est consommé par la
  couche native) : elle relève de la recette appareil.

## Voir aussi

- [ADR 0005 — Design system maison](./0005-design-system-maison.md)
