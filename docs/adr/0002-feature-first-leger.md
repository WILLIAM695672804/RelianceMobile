# ADR 0002 — Feature First léger

- Statut : acceptée (14/09/2026)

## Contexte

Le mobile ne porte aucune logique métier : toutes les règles résident dans le backend.

## Décision

Découpage par feature (`api/`, `schemas/`, `hooks/`, `screens/`, `components/`) sur un socle `core/` et des primitives `shared/`, sans couches DTO/entité/use case/dépôt.

## Conséquences

- Volume de code réduit ; le cache TanStack Query tient lieu de dépôt.
- La règle de dépendance entre couches est imposée par ESLint.
