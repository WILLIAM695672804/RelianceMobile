import { useTranslation } from 'react-i18next';

import { Badge, Card, ListItem, Screen, StateView, Text } from '@/shared/components';
import { formatAmount, formatDate } from '@/shared/format';

import { useWalletTransactions } from '../hooks/useWallet';
import { transactionToneOf } from '../model/transaction';

export interface TransactionDetailScreenProps {
  transactionId: string;
  onBack?: () => void;
}

/**
 * Détail d'un mouvement. Aucun point d'API unitaire n'existe : le mouvement est relu dans
 * la liste, déjà en cache lorsque l'écran s'ouvre depuis le portefeuille.
 */
export function TransactionDetailScreen({ transactionId, onBack }: TransactionDetailScreenProps) {
  const { t } = useTranslation();
  const transactions = useWalletTransactions();
  const transaction = (transactions.data ?? []).find((entry) => entry.id === transactionId);

  return (
    <Screen
      title={t('wallet:detail.title')}
      onBack={onBack}
      onRefresh={() => void transactions.refetch()}
      refreshing={transactions.isRefetching}
    >
      {transactions.isPending ? <StateView status="loading" /> : null}
      {transactions.isError ? (
        <StateView
          status="error"
          error={transactions.error}
          onRetry={() => void transactions.refetch()}
        />
      ) : null}
      {transactions.isSuccess && transaction === undefined ? (
        <StateView status="empty" message={t('wallet:detail.unknown')} />
      ) : null}
      {transaction !== undefined ? (
        <Card>
          <Badge
            label={t(`wallet:transaction.${transaction.type}`, {
              defaultValue: t('wallet:transaction.unknown'),
            })}
            tone={transactionToneOf(transaction.type)}
          />
          <Text variant="display">{formatAmount(transaction.amount)}</Text>
          {transaction.balance_after != null ? (
            <ListItem
              label={t('wallet:balanceAfter', {
                amount: formatAmount(transaction.balance_after),
              })}
              icon="wallet"
            />
          ) : null}
          {transaction.created_at ? (
            <ListItem
              label={t('wallet:detail.createdAt', { date: formatDate(transaction.created_at) })}
              icon="calendar"
            />
          ) : null}
          {typeof transaction.meta?.source === 'string' ? (
            <ListItem
              label={t('wallet:detail.source', {
                source: t(`wallet:detail.sources.${transaction.meta.source}`, {
                  defaultValue: transaction.meta.source,
                }),
              })}
              icon="file"
            />
          ) : null}
        </Card>
      ) : null}
    </Screen>
  );
}
