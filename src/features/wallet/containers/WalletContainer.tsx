import { useTranslation } from 'react-i18next';

import { formatDate } from '@/shared/format';
import { QueryGate } from '@/shared/ui';

import { useHolds } from '../hooks/useHolds';
import { useWallet, useWalletTransactions } from '../hooks/useWallet';
import type { Hold } from '../schemas/holdSchemas';
import type { Transaction } from '../schemas/walletSchemas';
import { WalletView, type WalletHold, type WalletMovement } from '../ui/WalletViews';

/** Types de mouvement qui diminuent le solde disponible. */
const OUTGOING = new Set(['debit', 'hold', 'withdrawal', 'payment', 'fee']);

export function toMovement(transaction: Transaction, label: string): WalletMovement {
  const sign = OUTGOING.has(transaction.type) ? -1 : 1;
  return {
    id: transaction.id,
    label,
    when: transaction.created_at ? formatDate(transaction.created_at) : '',
    amount: sign * Math.abs(transaction.amount),
  };
}

/** Libellé d'un fonds réservé : le serveur y inscrit une référence technique (`invoice:<id>`). */
export function holdLabel(
  reason: string | null | undefined,
  labels: { invoice: string; fallback: string },
): string {
  if (!reason) return labels.fallback;
  if (reason.startsWith('invoice:')) return labels.invoice;
  return /^[\w-]+:[0-9a-f-]{8,}/i.test(reason) ? labels.fallback : reason;
}

export function toWalletHold(hold: Hold, label: string): WalletHold {
  return {
    id: hold.id,
    label,
    detail: hold.created_at ? formatDate(hold.created_at) : '',
    amount: hold.amount,
    progress: 0.5,
  };
}

export interface WalletContainerProps {
  onTopUp: () => void;
  onWithdraw: () => void;
  onMovement: (transactionId: string) => void;
  onBack?: () => void;
}

/** Onglet « Portefeuille » : solde, fonds réservés et mouvements. */
export function WalletContainer({ onTopUp, onWithdraw, onMovement, onBack }: WalletContainerProps) {
  const { t } = useTranslation();
  const wallet = useWallet();
  const transactions = useWalletTransactions();
  const holds = useHolds();

  return (
    <QueryGate queries={[wallet, transactions]} withTabBar={!onBack}>
      {() => (
        <WalletView
          balance={wallet.data?.available_balance ?? 0}
          holds={(holds.data ?? [])
            .filter((hold) => hold.status === 'held')
            .map((hold) =>
              toWalletHold(
                hold,
                holdLabel(hold.reason, {
                  invoice: t('wallet:holdInvoice'),
                  fallback: t('wallet:transaction.hold'),
                }),
              ),
            )}
          sources={[]}
          movements={(transactions.data ?? []).map((transaction) =>
            toMovement(
              transaction,
              t(`wallet:transaction.${transaction.type}`, {
                defaultValue: t('wallet:transaction.unknown'),
              }),
            ),
          )}
          onTopUp={onTopUp}
          onWithdraw={onWithdraw}
          onMovement={(movement) => onMovement(movement.id)}
          onBack={onBack}
        />
      )}
    </QueryGate>
  );
}
