import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, View } from 'react-native';

import { useStorageUrl } from '@/core/api';
import {
  AdaptiveGrid,
  Badge,
  Button,
  Card,
  Icon,
  ListItem,
  Screen,
  StateView,
  Text,
} from '@/shared/components';
import { formatAmount, formatDate } from '@/shared/format';

import { useRequest } from '../hooks/useRequests';
import { iconForSkillSlug } from '../model/categoryIcons';
import { stageOf, STAGE_TONES } from '../model/requestStage';
import type { ServiceRequest } from '../schemas/requestSchemas';

export interface RequestDetailScreenProps {
  requestId: string;
  /** Ouverture des résultats du rapprochement (E11). */
  onFindTechnicians: () => void;
  /** Dépôt d'un avis sur une demande clôturée. */
  onReview?: (requestId: string) => void;
  /** Consultation du rapport d'intervention. */
  onOpenReport?: (requestId: string) => void;
  /** Contrôle qualité puis libération du séquestre, demande clôturée. */
  onOpenQuality?: (requestId: string, technicianId: string) => void;
  /** Ouverture d'un litige contre le technicien intervenu. */
  onOpenDispute?: (requestId: string, against: string) => void;
}

/** Détail d'une demande : description, lieu, photos, prix indicatif et étape du rapprochement. */
export function RequestDetailScreen({
  requestId,
  onFindTechnicians,
  onReview,
  onOpenReport,
  onOpenQuality,
  onOpenDispute,
}: RequestDetailScreenProps) {
  const { t } = useTranslation();
  const request = useRequest(requestId);
  const storageUrl = useStorageUrl();

  const renderRequest = (data: ServiceRequest) => {
    const stage = stageOf(data.status);
    const address = [data.address?.address, data.address?.city].filter(Boolean).join(', ');
    const suggestedPrice = data.analysis?.suggested_price;
    return (
      <>
        <Card>
          <View style={styles.titleRow}>
            <Icon name={iconForSkillSlug(data.category?.slug)} size={22} tone="primary" />
            <Text variant="title" accessibilityRole="header" style={styles.title}>
              {data.title}
            </Text>
          </View>
          <Badge label={t(`requests:stages.${stage}`)} tone={STAGE_TONES[stage]} />
          <Text>{data.description}</Text>
        </Card>
        <Card>
          {data.category ? (
            <ListItem
              label={t('requests:detail.category', { name: data.category.name })}
              icon="list"
            />
          ) : null}
          <ListItem
            label={t('requests:detail.createdAt', { date: formatDate(data.created_at) })}
            icon="calendar"
          />
          {address ? (
            <ListItem label={t('requests:detail.address', { address })} icon="pin" />
          ) : null}
          {suggestedPrice != null ? (
            <ListItem
              label={t('requests:detail.suggestedPrice', { amount: formatAmount(suggestedPrice) })}
              icon="wallet"
            />
          ) : null}
        </Card>
        {data.photos.length > 0 ? (
          <>
            <Text variant="subtitle">{t('requests:detail.photos')}</Text>
            <AdaptiveGrid minTileWidth={96} gap={8}>
              {data.photos.map((path, index) => (
                <Image
                  key={path}
                  source={{ uri: storageUrl(path) }}
                  accessibilityLabel={t('requests:detail.photo', { index: index + 1 })}
                  style={styles.photo}
                />
              ))}
            </AdaptiveGrid>
          </>
        ) : null}
        {stage === 'toMatch' ? (
          <Button
            label={t('requests:detail.findTechnicians')}
            icon="search"
            size="lg"
            fullWidth
            onPress={onFindTechnicians}
          />
        ) : null}
        {stage === 'awaitingTechnician' ? (
          <>
            <Text tone="primary">{t('requests:detail.awaiting')}</Text>
            <Button
              label={t('requests:detail.chooseAnother')}
              onPress={onFindTechnicians}
              variant="secondary"
            />
          </>
        ) : null}
        {onOpenQuality && stage === 'closed' && data.counterpart ? (
          <Button
            label={t('requests:detail.quality')}
            icon="shield"
            size="lg"
            fullWidth
            onPress={() => onOpenQuality(requestId, data.counterpart!.id)}
          />
        ) : null}
        {onOpenReport && (stage === 'closed' || stage === 'assigned') ? (
          <Button
            label={t('requests:detail.report')}
            icon="file"
            onPress={() => onOpenReport(requestId)}
            variant="secondary"
          />
        ) : null}
        {onReview && stage === 'closed' ? (
          <Button
            label={t('requests:detail.review')}
            icon="star"
            onPress={() => onReview(requestId)}
            variant="secondary"
          />
        ) : null}
        {onOpenDispute && data.counterpart && (stage === 'closed' || stage === 'assigned') ? (
          <Button
            label={t('requests:detail.dispute')}
            icon="shield"
            onPress={() => onOpenDispute(requestId, data.counterpart!.id)}
            variant="ghost"
          />
        ) : null}
        {stage === 'assigned' && data.counterpart ? (
          <Text tone="primary">
            {t('requests:detail.assigned', { name: data.counterpart.name })}
          </Text>
        ) : null}
      </>
    );
  };

  return (
    <Screen onRefresh={() => void request.refetch()} refreshing={request.isRefetching}>
      {request.isPending ? <StateView status="loading" /> : null}
      {request.isError ? (
        <StateView status="error" error={request.error} onRetry={() => void request.refetch()} />
      ) : null}
      {request.isSuccess ? renderRequest(request.data) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  title: { flex: 1 },
  photo: { width: '100%', aspectRatio: 1, borderRadius: 10 },
});
