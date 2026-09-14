# ADR 0006 — Dépôt autonome

- Statut : acceptée (14/09/2026)

## Contexte

Le frontend web (`RelianceFrontend/`) a son propre cycle de vie ; un monorepo imposerait une réorganisation.

## Décision

Dépôt Git autonome dans `RelianceMobile/`. Le code web utile est copié puis adapté.

## Conséquences

- Aucune modification du frontend web.
- Duplication maîtrisée des types d'API ; le contrat est garanti par les schémas Zod et les fixtures capturées.
