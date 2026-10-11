# ADR 0005 — Design system maison

- Statut : acceptée (14/09/2026)

## Contexte

Les maquettes (`design/maquettes/design-system.jsx`) définissent une identité propre : bleu `#1F5BC4`, polices Bricolage Grotesque et Inter, rayons 10/14/20/28.

## Décision

Jetons TypeScript (`src/core/theme/tokens.ts`) et primitives `StyleSheet` dans `src/shared/components/`, sans bibliothèque de composants tierce.

## Conséquences

- Maîtrise complète du rendu et de l'accessibilité ; aucune dépendance de style à maintenir.
- Chaque primitive est testée et expose un libellé d'accessibilité.

## Voir aussi

Le port du jeu d'icônes, les conventions Android et l'adaptativité sont décidés par
l'[ADR 0009](./0009-habillage-android-adaptatif.md).
