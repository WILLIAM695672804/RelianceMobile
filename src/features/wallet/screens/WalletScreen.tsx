import { useTranslation } from 'react-i18next';

import { Badge, Button, Card, Screen, StateView, Text } from '@/shared/components';
import { formatAmount, formatDate } from '@/shared/format';

import { useWallet, useWalletTransactions } from '../hooks/useWallet';
import { transactionToneOf } from '../model/transaction';
import type { Transaction, Wallet } from '../schemas/walletSchemas';

/** Mouvements présentés sur l'écran du portefeuille. */
const LISTED_TRANSACTIONS = 10;

export interface WalletScreenProps {
  onRecharge: () => void;
  onWithdraw: () => void;
}

/** E19 — Portefeuille : soldes, actions et derniers mouvements. */
export function WalletScreen({ onRecharge, onWithdraw }: WalletScreenProps) {
  const { t } = useTranslation();
  const wallet = useWallet();
  const transactions = useWalletTransactions();

  const refresh = () => {
    void wallet.refetch();
    void transactions.refetch();
  };

  const renderBalances = (data: Wallet) => (
    <>
      <Card>
        <Text variant="caption" tone="muted">
          {t('wallet:balance')}
        </Text>
        <Text variant="title">{formatAmount(data.balance)}</Text>
        {data.updated_at ? (
          <Text variant="caption" tone="muted">
            {t('wallet:updatedAt', { date: formatDate(data.updated_at) })}
          </Text>
        ) : null}
      </Card>
      <Card>
        <Text variant="caption" tone="muted">
          {t('wallet:available')}
        </Text>
        <Text variant="subtitle">{formatAmount(data.available_balance)}</Text>
      </Card>
      <Card>
        <Text variant="caption" tone="muted">
          {t('wallet:held')}
        </Text>
        <Text variant="subtitle">{formatAmount(data.held_amount ?? 0)}</Text>
      </Card>
    </>
  );

  const renderTransaction = (transaction: Transaction) => (
    <Card key={transaction.id}>
      <Badge
        label={t(`wallet:transaction.${transaction.type}`, {
          defaultValue: t('wallet:transaction.unknown'),
        })}
        tone={transactionToneOf(transaction.type)}
      />
      <Text>
        {t('wallet:transactionLine', {
          amount: formatAmount(transaction.amount),
          date: formatDate(transaction.created_at ?? ''),
        })}
      </Text>
      {transaction.balance_after != null ? (
        <Text variant="caption" tone="muted">
          {t('wallet:balanceAfter', { amount: formatAmount(transaction.balance_after) })}
        </Text>
      ) : null}
    </Card>
  );

  const renderHistory = () => {
    if (transactions.isPending) return <StateView status="loading" />;
    if (transactions.isError) {
      return (
        <StateView
          status="error"
          error={transactions.error}
          onRetry={() => void transactions.refetch()}
        />
      );
    }
    if (transactions.data.length === 0) {
      return <StateView status="empty" message={t('wallet:historyEmpty')} />;
    }
    return transactions.data.slice(0, LISTED_TRANSACTIONS).map(renderTransaction);
  };

  return (
    <Screen onRefresh={refresh} refreshing={wallet.isRefetching}>
      <Text variant="title" accessibilityRole="header">
        {t('wallet:title')}
      </Text>
      {wallet.isPending ? <StateView status="loading" /> : null}
      {wallet.isError ? (
        <StateView status="error" error={wallet.error} onRetry={() => void wallet.refetch()} />
      ) : null}
      {wallet.isSuccess ? renderBalances(wallet.data) : null}
      <Button label={t('wallet:recharge')} onPress={onRecharge} />
      <Button label={t('wallet:withdraw')} onPress={onWithdraw} variant="secondary" />
      <Text variant="subtitle">{t('wallet:history')}</Text>
      {renderHistory()}
    </Screen>
  );
}
