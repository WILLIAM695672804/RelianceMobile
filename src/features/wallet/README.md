# Feature `wallet`

Portefeuille : soldes, historique, recharge et retrait.

## Périmètre

| Écran              | Composant        | Route                                    |
| ------------------ | ---------------- | ---------------------------------------- |
| E19 — Portefeuille | `WalletScreen`   | `app/(portefeuille)/wallet/index.tsx`    |
| E20 — Recharge     | `RechargeScreen` | `app/(portefeuille)/wallet/recharge.tsx` |
| E21 — Retrait      | `WithdrawScreen` | `app/(portefeuille)/wallet/withdraw.tsx` |

Règles appliquées côté mobile : montants entiers en FCFA, recharge d'au moins 100, retrait d'au moins 500, numéro camerounais à neuf chiffres commençant par 6 exigé pour le mobile money. Le mobile annonce une demande **initiée** : le crédit dépend de la passerelle, et le solde est rafraîchi par le canal `wallet.{id}`.

## Endpoints

| Fonction            | Méthode et route           | Hook                    |
| ------------------- | -------------------------- | ----------------------- |
| `fetchWallet`       | `GET /wallet`              | `useWallet`             |
| `fetchTransactions` | `GET /wallet/transactions` | `useWalletTransactions` |
| `rechargeWallet`    | `POST /wallet/recharge`    | `useRechargeWallet`     |
| `requestWithdrawal` | `POST /wallet/withdraw`    | `useRequestWithdrawal`  |

## Canaux temps réel

`wallet.{userId}` : `BalanceUpdated`, `HoldCaptured`, `HoldReleased` et `PaymentSettled` invalident `walletKeys.all` (`useWalletSync`, monté dans `src/bootstrap/RealtimeBridge.tsx`).

## Fixtures

`src/test/fixtures/wallet/` — capturées par `./scripts/capture-finance-fixtures.sh`, puis anonymisées.

## Limites connues

- En local, la passerelle NotchPay n'est pas joignable : la recharge répond 422 avec `status: "failed"`.
- `holds/*`, `payments/*`, les abonnements et les crédits restent hors périmètre.
- Une seule page d'historique (20 transactions) est lue.
