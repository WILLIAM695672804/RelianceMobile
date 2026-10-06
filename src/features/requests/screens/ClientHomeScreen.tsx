import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { useSession } from '@/core/session';
import { Avatar, Badge, Button, ListItem, Screen, StateView, Text } from '@/shared/components';
import { formatDate } from '@/shared/format';

import { useRequests } from '../hooks/useRequests';
import { countOpenRequests, MAX_OPEN_REQUESTS, stageOf, STAGE_TONES } from '../model/requestStage';
import type { ServiceRequest } from '../schemas/requestSchemas';

/** Nombre de demandes affichées dans « Demandes récentes ». */
const RECENT_LIMIT = 5;

export interface ClientHomeScreenProps {
  /** Ouverture de la liste complète des demandes. */
  onOpenAll?: () => void;
  onNewRequest: () => void;
  onOpenRequest: (requestId: string) => void;
}

/** E05 — Accueil client : demandes en cours, demandes récentes, création d'une demande. */
export function ClientHomeScreen({
  onNewRequest,
  onOpenRequest,
  onOpenAll,
}: ClientHomeScreenProps) {
  const { t } = useTranslation();
  const user = useSession((state) => state.user);
  const requests = useRequests();
  const openCount = requests.data ? countOpenRequests(requests.data.data) : 0;
  const limitReached = openCount >= MAX_OPEN_REQUESTS;

  const renderRequest = (request: ServiceRequest) => {
    const stage = stageOf(request.status);
    const detail = [
      t(`requests:stages.${stage}`),
      request.category?.name,
      formatDate(request.created_at),
    ]
      .filter(Boolean)
      .join(' · ');
    return (
      <View key={request.id} style={styles.request}>
        <ListItem label={request.title} detail={detail} onPress={() => onOpenRequest(request.id)} />
        <Badge label={t(`requests:stages.${stage}`)} tone={STAGE_TONES[stage]} />
      </View>
    );
  };

  const renderRequests = () => {
    if (requests.isPending) return <StateView status="loading" />;
    if (requests.isError) {
      return (
        <View style={styles.error}>
          <Text tone="danger">{t('requests:home.loadError')}</Text>
          <Button
            label={t('common:actions.retry')}
            onPress={() => void requests.refetch()}
            variant="secondary"
          />
        </View>
      );
    }
    if (requests.data.data.length === 0) {
      return <StateView status="empty" message={t('requests:home.empty')} />;
    }
    return (
      <>
        <Text variant="subtitle">{t('requests:home.recent')}</Text>
        {requests.data.data.slice(0, RECENT_LIMIT).map(renderRequest)}
      </>
    );
  };

  return (
    <Screen onRefresh={() => void requests.refetch()} refreshing={requests.isRefetching}>
      <View style={styles.header}>
        <Avatar name={user?.name ?? ''} uri={user?.avatarUrl} size={48} />
        <View style={styles.headerText}>
          <Text variant="title" accessibilityRole="header">
            {t('requests:home.greeting', { name: user?.name ?? '' })}
          </Text>
          {requests.isSuccess ? (
            <Text tone="muted">{t('requests:home.openCount', { count: openCount })}</Text>
          ) : null}
        </View>
      </View>
      <Button
        label={t('requests:home.newRequest')}
        onPress={onNewRequest}
        disabled={limitReached}
      />
      {limitReached ? (
        <Text tone="muted">{t('requests:home.limitReached', { max: MAX_OPEN_REQUESTS })}</Text>
      ) : null}
      {onOpenAll ? (
        <Button label={t('requests:home.openAll')} onPress={onOpenAll} variant="ghost" />
      ) : null}
      {renderRequests()}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerText: { flex: 1, gap: 4 },
  request: { gap: 4 },
  error: { alignItems: 'center', gap: 12, padding: 24 },
});
