import { useTranslation } from 'react-i18next';

import { formatAmount, formatDate } from '@/shared/format';
import { BackButton, EmptyState, QueryGate, Screen } from '@/shared/ui';

import { useWalletTransactions } from '../hooks/useWallet';
import type { Transaction } from '../schemas/walletSchemas';
import { TransactionView, type TransactionDetail } from '../ui/WalletViews';
import { toMovement } from './WalletContainer';

type Translate = (key: string, options?: Record<string, unknown>) => string;

/** Mouvement du serveur présenté en reçu : date, solde après opération, origine. */
export function toTransactionDetail(transaction: Transaction, t: Translate): TransactionDetail {
  const label = t(`wallet:transaction.${transaction.type}`, {
    defaultValue: t('wallet:transaction.unknown'),
  });
  const source = typeof transaction.meta?.source === 'string' ? transaction.meta.source : null;
  const rows: TransactionDetail['rows'][number][] = [];
  if (transaction.created_at) {
    rows.push({ label: t('wallet:movement.date'), value: formatDate(transaction.created_at) });
  }
  if (transaction.balance_after != null) {
    rows.push({
      label: t('wallet:movement.balanceAfter'),
      value: formatAmount(transaction.balance_after),
    });
  }
  if (source) {
    rows.push({
      label: t('wallet:movement.source'),
      value: t(`wallet:detail.sources.${source}`, { defaultValue: source }),
    });
  }
  rows.push({
    label: t('wallet:movement.reference'),
    value: transaction.id.slice(0, 8).toUpperCase(),
  });
  return {
    id: transaction.id,
    type: label,
    amount: toMovement(transaction, label).amount,
    status: t('wallet:movement.recorded'),
    rows,
    breakdown: [],
    note: null,
  };
}

export interface TransactionContainerProps {
  transactionId: string;
  onBack: () => void;
}

/**
 * Détail d'un mouvement. Aucun point d'API unitaire n'existe : le mouvement est relu dans la
 * liste, déjà en cache lorsque l'écran s'ouvre depuis le portefeuille.
 */
export function TransactionContainer({ transactionId, onBack }: TransactionContainerProps) {
  const { t } = useTranslation();
  const transactions = useWalletTransactions();

  return (
    <QueryGate queries={[transactions]}>
      {() => {
        const found = (transactions.data ?? []).find((entry) => entry.id === transactionId);
        if (!found) {
          return (
            <Screen testID="mouvement-absent">
              <BackButton onPress={onBack} />
              <EmptyState
                icon="wallet"
                title={t('wallet:detail.title')}
                message={t('wallet:detail.unknown')}
              />
            </Screen>
          );
        }
        return <TransactionView transaction={toTransactionDetail(found, t)} onBack={onBack} />;
      }}
    </QueryGate>
  );
}
