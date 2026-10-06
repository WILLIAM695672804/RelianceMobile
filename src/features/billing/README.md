# Feature `billing`

Devis d'une intervention et factures.

## Périmètre

| Écran                      | Composant             | Route                                      |
| -------------------------- | --------------------- | ------------------------------------------ |
| E16 — Rédaction d'un devis | `QuoteEditorCard`     | intégré à l'écran des devis (technicien)   |
| E17 — Devis d'une demande  | `RequestQuotesScreen` | `app/(facturation)/quotes/[requestId].tsx` |
| E22 — Factures             | `InvoicesScreen`      | `app/(facturation)/invoices/index.tsx`     |
| Détail d'une facture       | `InvoiceDetailScreen` | `app/(facturation)/invoices/[id].tsx`      |

Un seul écran sert les deux rôles : le technicien rédige, enregistre un brouillon ou envoie ; le client accepte ou refuse les devis envoyés. L'acceptation fait émettre la facture par le serveur et repasse la demande à « attribuée ». Le client peut ensuite déclarer le paiement.

Règles appliquées côté mobile : montants entiers en FCFA ; total égal à la somme des lignes dès qu'une ligne existe ; validité de 1 à 90 jours convertie en date ; seuls les devis `draft` s'envoient et seuls les devis `sent` se décident (le serveur accepterait aussi un brouillon).

## Endpoints

| Fonction             | Méthode et route                   | Hook               |
| -------------------- | ---------------------------------- | ------------------ |
| `createQuote`        | `POST /quotes`                     | `useCreateQuote`   |
| `fetchRequestQuotes` | `GET /requests/{requestId}/quotes` | `useRequestQuotes` |
| `fetchQuote`         | `GET /quotes/{id}`                 | `useQuote`         |
| `sendQuote`          | `POST /quotes/{id}/send`           | `useSendQuote`     |
| `acceptQuote`        | `POST /quotes/{id}/accept`         | `useAcceptQuote`   |
| `rejectQuote`        | `POST /quotes/{id}/reject`         | `useRejectQuote`   |
| `fetchInvoices`      | `GET /invoices`                    | `useInvoices`      |
| `fetchInvoice`       | `GET /invoices/{id}`               | `useInvoice`       |
| `payInvoice`         | `POST /invoices/{id}/pay`          | `usePayInvoice`    |

## Canaux temps réel

`quotes.{userId}` : `QuoteSubmitted` et `InvoiceCreated` invalident `billingKeys.all` (`useQuotesSync`, monté dans `src/bootstrap/RealtimeBridge.tsx`).

## Fixtures

`src/test/fixtures/billing/` — capturées par `./scripts/capture-billing-fixtures.sh`, puis anonymisées.

## Limites connues

- Aucun règlement réel : `POST /invoices/{id}/pay` marque seulement la facture payée.
- Les factures ne sont pas paginées côté mobile (première page, 15 éléments).
- Le serveur ne vérifie pas que l'appelant de `GET /requests/{id}/quotes` est partie à la demande.
- Aucun document PDF n'est produit (`external_pdf_ref` reste nul).
