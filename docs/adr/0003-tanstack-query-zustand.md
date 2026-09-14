# ADR 0003 — TanStack Query et Zustand

- Statut : acceptée (14/09/2026)

## Contexte

L'état est majoritairement un reflet du serveur ; l'état purement client se limite à la session, la connectivité et le temps réel.

## Décision

TanStack Query 5 pour l'état serveur (persistance MMKV sur liste blanche) ; Zustand 5 pour l'état client.

## Conséquences

- Relance, invalidation, pause hors ligne et reprise des mutations fournies par la bibliothèque.
- Les features déclarent explicitement `meta: { persist: true }` pour persister une requête.
