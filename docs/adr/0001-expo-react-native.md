# ADR 0001 — React Native + Expo

- Statut : acceptée (14/09/2026)

## Contexte

Les Documents 3 et 6 prévoyaient Flutter. Le frontend web est en React + TypeScript (services Axios, hooks Echo, TanStack Query) et les maquettes mobiles sont rédigées en JSX.

## Décision

React Native avec Expo (SDK stable courant), Expo Router et development build.

## Conséquences

- Portage direct des services, types et hooks du web.
- Compilation iOS possible sans Mac via EAS (hors périmètre du lot).
- Expo Go inutilisable : modules natifs (cookies, MMKV).
