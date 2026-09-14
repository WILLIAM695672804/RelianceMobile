# ADR 0007 — Pile de tests

- Statut : acceptée (14/09/2026)

## Contexte

Le lot doit être testé ; le socle transverse conditionne la sûreté de toutes les features.

## Décision

Jest (`jest-expo`), React Native Testing Library 14, `axios-mock-adapter` ; Maestro pour le bout en bout (local, hors CI). TDD obligatoire sur `src/core/`. Seuils bloquants : 70 % global, 85 % sur `src/core/`.

## Conséquences

- Les adaptateurs natifs (cookies, polices) sont exclus de la couverture et vérifiés par recette manuelle.
- Les tests d'interface attendent systématiquement les API asynchrones de RNTL 14.
