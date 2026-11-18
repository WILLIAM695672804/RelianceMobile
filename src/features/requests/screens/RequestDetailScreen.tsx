import { useTranslation } from 'react-i18next';
import { Image, View } from 'react-native';

import { useStorageUrl } from '@/core/api';
import {
  Banner,
  Button,
  Card,
  DetailHeader,
  ListRow,
  Pill,
  QueryGate,
  Screen,
  SectionLabel,
  Text,
} from '@/shared/ui';
import { formatAmount, formatDate } from '@/shared/format';

import { useRequest } from '../hooks/useRequests';
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
  onBack?: () => void;
}

/** Détail d'une demande : description, lieu, photos, prix indicatif et étape du rapprochement. */
export function RequestDetailScreen({
  requestId,
  onFindTechnicians,
  onReview,
  onOpenReport,
  onOpenQuality,
  onOpenDispute,
  onBack,
}: RequestDetailScreenProps) {
  const { t } = useTranslation();
  const request = useRequest(requestId);
  const storageUrl = useStorageUrl();

  const renderRequest = (data: ServiceRequest) => {
    const stage = stageOf(data.status);
    const address = [data.address?.address, data.address?.city].filter(Boolean).join(', ');
    const suggestedPrice = data.analysis?.suggested_price;
    const facts = [
      data.category
        ? {
            icon: 'list' as const,
            label: t('requests:detail.category', { name: data.category.name }),
          }
        : null,
      {
        icon: 'calendar' as const,
        label: t('requests:detail.createdAt', { date: formatDate(data.created_at) }),
      },
      address ? { icon: 'pin' as const, label: t('requests:detail.address', { address }) } : null,
      suggestedPrice != null
        ? {
            icon: 'wallet' as const,
            label: t('requests:detail.suggestedPrice', { amount: formatAmount(suggestedPrice) }),
          }
        : null,
    ].filter((fact): fact is { icon: 'list' | 'calendar' | 'pin' | 'wallet'; label: string } =>
      Boolean(fact),
    );
    return (
      <>
        <DetailHeader
          eyebrow={`#${data.id.slice(0, 8).toUpperCase()}`}
          title={data.title}
          onBack={onBack}
          trailing={
            <Pill label={t(`requests:stages.${stage}`)} tone={STAGE_TONES[stage]} size="sm" />
          }
        />
        <View style={{ paddingHorizontal: 20, gap: 14 }}>
          <Card padding={16}>
            <Text>{data.description}</Text>
          </Card>
          <Card padding={0}>
            {facts.map((fact, index) => (
              <ListRow key={fact.label} icon={fact.icon} divider={index > 0} title={fact.label} />
            ))}
          </Card>
          {data.photos.length > 0 ? (
            <View>
              <SectionLabel label={t('requests:detail.photos')} icon="camera" />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {data.photos.map((path, index) => (
                  <Image
                    key={path}
                    source={{ uri: storageUrl(path) }}
                    accessibilityLabel={t('requests:detail.photo', { index: index + 1 })}
                    style={{ width: '31%', aspectRatio: 1, borderRadius: 12 }}
                  />
                ))}
              </View>
            </View>
          ) : null}
          {stage === 'assigned' && data.counterpart ? (
            <Banner
              tone="success"
              message={t('requests:detail.assigned', { name: data.counterpart.name })}
            />
          ) : null}
          {stage === 'toMatch' ? (
            <Button
              label={t('requests:detail.findTechnicians')}
              icon="search"
              size="lg"
              full
              onPress={onFindTechnicians}
            />
          ) : null}
          {stage === 'awaitingTechnician' ? (
            <>
              <Banner tone="warning" message={t('requests:detail.awaiting')} />
              <Button
                label={t('requests:detail.chooseAnother')}
                variant="soft"
                full
                onPress={onFindTechnicians}
              />
            </>
          ) : null}
          {onOpenQuality && stage === 'closed' && data.counterpart ? (
            <Button
              label={t('requests:detail.quality')}
              icon="shield"
              size="lg"
              full
              onPress={() => onOpenQuality(requestId, data.counterpart!.id)}
            />
          ) : null}
          {onOpenReport && (stage === 'closed' || stage === 'assigned') ? (
            <Button
              label={t('requests:detail.report')}
              icon="file"
              variant="soft"
              full
              onPress={() => onOpenReport(requestId)}
            />
          ) : null}
          {onReview && stage === 'closed' ? (
            <Button
              label={t('requests:detail.review')}
              icon="star"
              variant="soft"
              full
              onPress={() => onReview(requestId)}
            />
          ) : null}
          {onOpenDispute && data.counterpart && (stage === 'closed' || stage === 'assigned') ? (
            <Button
              label={t('requests:detail.dispute')}
              icon="shield"
              variant="ghost"
              full
              onPress={() => onOpenDispute(requestId, data.counterpart!.id)}
            />
          ) : null}
        </View>
      </>
    );
  };

  return (
    <Screen
      testID="detail-demande"
      onRefresh={() => void request.refetch()}
      refreshing={request.isRefetching}
    >
      <QueryGate queries={[request]}>{() => renderRequest(request.data!)}</QueryGate>
    </Screen>
  );
}
