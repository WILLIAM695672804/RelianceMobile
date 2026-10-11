import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Badge, Card, Icon, Screen, StateView, Text } from '@/shared/components';
import { formatDate } from '@/shared/format';

import { useRequests } from '../hooks/useRequests';
import { iconForSkillSlug } from '../model/categoryIcons';
import { stageOf, STAGE_TONES } from '../model/requestStage';

export interface RequestsListScreenProps {
  /** Ouverture du détail d'une demande. */
  onOpenRequest: (requestId: string) => void;
}

/** Toutes les demandes du client, les plus récentes d'abord. */
export function RequestsListScreen({ onOpenRequest }: RequestsListScreenProps) {
  const { t } = useTranslation();
  const requests = useRequests();

  const renderRequests = () => {
    if (requests.isPending) return <StateView status="loading" />;
    if (requests.isError) {
      return (
        <StateView status="error" error={requests.error} onRetry={() => void requests.refetch()} />
      );
    }
    if (requests.data.data.length === 0) {
      return <StateView status="empty" message={t('requests:list.empty')} />;
    }
    return (
      <>
        <Text tone="muted">{t('requests:list.count', { count: requests.data.meta.total })}</Text>
        {requests.data.data.map((request) => {
          const stage = stageOf(request.status);
          return (
            <Card
              key={request.id}
              onPress={() => onOpenRequest(request.id)}
              accessibilityLabel={t('requests:list.openNamed', { title: request.title })}
            >
              <View style={styles.row}>
                <Icon name={iconForSkillSlug(request.category?.slug)} size={20} tone="primary" />
                <Text variant="subtitle" style={styles.title} numberOfLines={2}>
                  {request.title}
                </Text>
                <Icon name="chevronR" size={18} tone="muted" />
              </View>
              <Badge label={t(`requests:stages.${stage}`)} tone={STAGE_TONES[stage]} />
              <Text variant="caption" tone="muted">
                {t('requests:list.createdAt', { date: formatDate(request.created_at) })}
              </Text>
            </Card>
          );
        })}
      </>
    );
  };

  return (
    <Screen
      title={t('requests:list.title')}
      onRefresh={() => void requests.refetch()}
      refreshing={requests.isRefetching}
    >
      {renderRequests()}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { flex: 1 },
});
