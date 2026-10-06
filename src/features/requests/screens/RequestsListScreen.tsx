import { useTranslation } from 'react-i18next';

import { Badge, Button, Card, Screen, StateView, Text } from '@/shared/components';
import { formatDate } from '@/shared/format';

import { useRequests } from '../hooks/useRequests';
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
            <Card key={request.id}>
              <Text variant="subtitle">{request.title}</Text>
              <Badge label={t(`requests:stages.${stage}`)} tone={STAGE_TONES[stage]} />
              <Text variant="caption" tone="muted">
                {t('requests:list.createdAt', { date: formatDate(request.created_at) })}
              </Text>
              <Button
                label={t('requests:list.open')}
                accessibilityLabel={t('requests:list.openNamed', { title: request.title })}
                onPress={() => onOpenRequest(request.id)}
                variant="secondary"
              />
            </Card>
          );
        })}
      </>
    );
  };

  return (
    <Screen onRefresh={() => void requests.refetch()} refreshing={requests.isRefetching}>
      <Text variant="title" accessibilityRole="header">
        {t('requests:list.title')}
      </Text>
      {renderRequests()}
    </Screen>
  );
}
