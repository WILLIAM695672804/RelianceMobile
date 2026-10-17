import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Badge, Card, Icon, Screen, StateView, Text } from '@/shared/components';
import { formatDate } from '@/shared/format';

import { useDisputes } from '../hooks/useDisputes';
import { DISPUTE_TONES } from '../model/disputeTones';
import type { Dispute } from '../schemas/disputeSchemas';

export interface DisputesScreenProps {
  /** Ouverture du fil d'un litige. */
  onOpen: (disputeId: string) => void;
}

/** Litiges ouverts par la personne connectée ou dirigés contre elle. */
export function DisputesScreen({ onOpen }: DisputesScreenProps) {
  const { t } = useTranslation();
  const disputes = useDisputes();

  const renderDispute = (dispute: Dispute) => {
    const reason = t(`disputes:reasons.${dispute.reason}`, { defaultValue: dispute.reason });
    return (
      <Card
        key={dispute.id}
        onPress={() => onOpen(dispute.id)}
        accessibilityLabel={t('disputes:list.open', { reason })}
      >
        <View style={styles.header}>
          <Icon name="shield" size={20} tone="primary" />
          <Text variant="subtitle" style={styles.title}>
            {reason}
          </Text>
          <Badge
            label={t(`disputes:statuses.${dispute.status}`)}
            tone={DISPUTE_TONES[dispute.status]}
          />
        </View>
        {dispute.defendant ? (
          <Text tone="muted">{t('disputes:list.against', { name: dispute.defendant.name })}</Text>
        ) : null}
        {dispute.description ? <Text numberOfLines={2}>{dispute.description}</Text> : null}
        {dispute.created_at ? (
          <Text variant="caption" tone="muted">
            {t('disputes:list.openedAt', { date: formatDate(dispute.created_at) })}
          </Text>
        ) : null}
      </Card>
    );
  };

  const renderList = () => {
    if (disputes.isPending) return <StateView status="loading" />;
    if (disputes.isError) {
      return (
        <StateView status="error" error={disputes.error} onRetry={() => void disputes.refetch()} />
      );
    }
    if (disputes.data.length === 0) {
      return <StateView status="empty" message={t('disputes:list.empty')} />;
    }
    return disputes.data.map(renderDispute);
  };

  return (
    <Screen
      title={t('disputes:list.title')}
      onRefresh={() => void disputes.refetch()}
      refreshing={disputes.isRefetching}
    >
      {renderList()}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1 },
});
