# ADR 0004 — Session Sanctum par cookie

- Statut : acceptée (14/09/2026), amendée (14/09/2026 : module de cookies local)

## Contexte

Le backend authentifie par session web (`Auth::guard('web')->login`) et protège les écritures par CSRF. Les PDF (jeton Bearer, `/auth/refresh`) sont caducs sur ce point.

## Décision

Le mobile se comporte comme un client SPA « stateful » : cookies natifs, en-tête `X-XSRF-TOKEN` lu dans le cookie `XSRF-TOKEN`, en-têtes `Origin`/`Referer` fixés à une origine déclarée dans `SANCTUM_STATEFUL_DOMAINS`. Seule la configuration du backend change.

## Conséquences

- Lecture du cookie `XSRF-TOKEN` isolée derrière l'interface `CookieReader`.
- Implémentation par un module Expo local, `modules/reliance-cookies` (Expo Modules API) : `android.webkit.CookieManager` sur Android — magasin auquel `ForwardingCookieHandler` de React Native délègue la persistance des cookies d'OkHttp — et `HTTPCookieStorage.shared` sur iOS. Sans dépendance tierce et compatible avec la New Architecture.
- Amendement (14/09/2026) : `@react-native-cookies/cookies`, initialement retenu, a été écarté (non maintenu, incompatible avec la New Architecture et avec Gradle 9).
- **Repli** si le module natif s'avérait défaillant : lire `set-cookie` dans la réponse de `/sanctum/csrf-cookie` au sein de `createCsrfCookieFetcher`, sans modifier `CsrfManager`.
- Expiration de session gérée par la réponse 401 (durée de vie : configuration Sanctum/session du backend).
