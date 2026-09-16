import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, View } from 'react-native';

import { useStorageUrl } from '@/core/api';
import { Badge, Button, Screen, StateView, Text } from '@/shared/components';
import { formatAmount, formatDate } from '@/shared/format';

import { useRequest } from '../hooks/useRequests';
import { stageOf, STAGE_TONES } from '../model/requestStage';
import type { ServiceRequest } from '../schemas/requestSchemas';

export interface RequestDetailScreenProps {
  requestId: string;
  /** Ouverture des résultats du rapprochement (E11). */
  onFindTechnicians: () => void;
}

/** Détail d'une demande : description, lieu, photos, prix indicatif et étape du rapprochement. */
export function RequestDetailScreen({ requestId, onFindTechnicians }: RequestDetailScreenProps) {
  const { t } = useTranslation();
  const request = useRequest(requestId);
  const storageUrl = useStorageUrl();

  const renderRequest = (data: ServiceRequest) => {
    const stage = stageOf(data.status);
    const address = [data.address?.address, data.address?.city].filter(Boolean).join(', ');
    const suggestedPrice = data.analysis?.suggested_price;
    return (
      <>
        <Text variant="title" accessibilityRole="header">
          {data.title}
        </Text>
        <Badge label={t(`requests:stages.${stage}`)} tone={STAGE_TONES[stage]} />
        {data.category ? (
          <Text tone="muted">{t('requests:detail.category', { name: data.category.name })}</Text>
        ) : null}
        <Text tone="muted">
          {t('requests:detail.createdAt', { date: formatDate(data.created_at) })}
        </Text>
        <Text>{data.description}</Text>
        {address ? <Text>{t('requests:detail.address', { address })}</Text> : null}
        {suggestedPrice != null ? (
          <Text>
            {t('requests:detail.suggestedPrice', { amount: formatAmount(suggestedPrice) })}
          </Text>
        ) : null}
        {data.photos.length > 0 ? (
          <>
            <Text variant="subtitle">{t('requests:detail.photos')}</Text>
            <View style={styles.photos}>
              {data.photos.map((path, index) => (
                <Image
                  key={path}
                  source={{ uri: storageUrl(path) }}
                  accessibilityLabel={t('requests:detail.photo', { index: index + 1 })}
                  style={styles.photo}
                />
              ))}
            </View>
          </>
        ) : null}
        {stage === 'toMatch' ? (
          <Button label={t('requests:detail.findTechnicians')} onPress={onFindTechnicians} />
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
  photos: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photo: { width: 96, height: 96, borderRadius: 8 },
});
