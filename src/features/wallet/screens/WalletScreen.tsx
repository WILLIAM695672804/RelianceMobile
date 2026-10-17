import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import {
  AdaptiveGrid,
  Badge,
  Button,
  Card,
  Icon,
  Screen,
  StateView,
  StatTile,
  Text,
} from '@/shared/components';
import { formatAmount, formatDate } from '@/shared/format';

import { useWallet, useWalletTransactions } from '../hooks/useWallet';
import { transactionToneOf } from '../model/transaction';
import type { Transaction, Wallet } from '../schemas/walletSchemas';

/** Mouvements présentés sur l'écran du portefeuille. */
const LISTED_TRANSACTIONS = 10;

export interface WalletScreenProps {
  onRecharge: () => void;
  onWithdraw: () => void;
  /** Ouverture du détail d'un mouvement. */
  onOpenTransaction?: (transactionId: string) => void;
}

/** E19 — Portefeuille : soldes, actions et derniers mouvements. */
export function WalletScreen({ onRecharge, onWithdraw, onOpenTransaction }: WalletScreenProps) {
  const { t } = useTranslation();
  const wallet = useWallet();
  const transactions = useWalletTransactions();

  const refresh = () => {
    void wallet.refetch();
    void transactions.refetch();
  };

  const renderBalances = (data: Wallet) => (
    <>
      <Card tone="primary">
        <View style={styles.balanceHeader}>
          <Icon name="wallet" size={22} tone="primary" />
          <Text variant="caption" tone="muted" style={styles.flex}>
            {t('wallet:balance')}
          </Text>
        </View>
        <Text variant="display">{formatAmount(data.balance)}</Text>
        {data.updated_at ? (
          <Text variant="caption" tone="muted">
            {t('wallet:updatedAt', { date: formatDate(data.updated_at) })}
          </Text>
        ) : null}
      </Card>
      <AdaptiveGrid minTileWidth={140} gap={12}>
        <StatTile
          icon="check"
          value={formatAmount(data.available_balance)}
          label={t('wallet:available')}
        />
        <StatTile
          icon="shield"
          value={formatAmount(data.held_amount ?? 0)}
          label={t('wallet:held')}
        />
      </AdaptiveGrid>
    </>
  );

  const renderTransaction = (transaction: Transaction) => (
    <Card
      key={transaction.id}
      onPress={onOpenTransaction ? () => onOpenTransaction(transaction.id) : undefined}
      accessibilityLabel={
        onOpenTransaction
          ? t('wallet:detail.open', { amount: formatAmount(transaction.amount) })
          : undefined
      }
    >
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
    <Screen title={t('wallet:title')} onRefresh={refresh} refreshing={wallet.isRefetching}>
      {wallet.isPending ? <StateView status="loading" /> : null}
      {wallet.isError ? (
        <StateView status="error" error={wallet.error} onRetry={() => void wallet.refetch()} />
      ) : null}
      {wallet.isSuccess ? renderBalances(wallet.data) : null}
      <View style={styles.actions}>
        <Button label={t('wallet:recharge')} icon="arrowUp" onPress={onRecharge} />
        <Button label={t('wallet:withdraw')} icon="send" onPress={onWithdraw} variant="secondary" />
      </View>
      <Text variant="subtitle">{t('wallet:history')}</Text>
      {renderHistory()}
    </Screen>
  );
}

const styles = StyleSheet.create({
  balanceHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flex: { flex: 1 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
