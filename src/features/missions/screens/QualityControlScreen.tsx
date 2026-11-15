import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, View } from 'react-native';

import { useStorageUrl } from '@/core/api';
import { describeError, normalizeError } from '@/core/errors';
import { useTheme } from '@/core/theme';
import {
  interventionForRequest,
  useInterventions,
  type Intervention,
} from '@/features/interventions';
import { useRequest } from '@/features/requests';
import { holdForRequest, useCaptureHold, useHolds, type Hold } from '@/features/wallet';
import {
  AdaptiveGrid,
  Button,
  Card,
  Icon,
  ListItem,
  Screen,
  SectionHeader,
  Snackbar,
  StateView,
  Text,
} from '@/shared/components';
import { formatAmount, formatHours } from '@/shared/format';

/** Méthode de versement au technicien ; le serveur l'exige sans la vérifier. */
const PAYOUT_METHOD = 'momo';

export interface QualityControlScreenProps {
  requestId: string;
  /** Technicien bénéficiaire du séquestre. */
  technicianId: string;
  onBack?: () => void;
  /** Dépôt d'un avis, après la libération. */
  onRate: (requestId: string) => void;
  /** Ouverture d'un litige en lieu et place de la validation. */
  onOpenDispute: (requestId: string, against: string) => void;
  /** Sortie du parcours. */
  onDone: () => void;
}

/**
 * Contrôle qualité : le client relit le rapport et les photos, puis libère le séquestre au
 * profit du technicien. Transposition de `ValidationScreen` et `EscrowReleaseScreen`.
 */
export function QualityControlScreen({
  requestId,
  technicianId,
  onBack,
  onRate,
  onOpenDispute,
  onDone,
}: QualityControlScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const request = useRequest(requestId);
  const interventions = useInterventions();
  const holds = useHolds();
  const hold = holds.data ? holdForRequest(holds.data, requestId) : null;
  const capture = useCaptureHold(hold?.id ?? '');
  const report = interventions.data ? interventionForRequest(interventions.data, requestId) : null;
  const [released, setReleased] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validate = async () => {
    if (hold === null) return;
    setError(null);
    try {
      await capture.mutateAsync({ payeeId: technicianId, method: PAYOUT_METHOD });
      setReleased(hold.amount);
    } catch (cause) {
      setError(describeError(normalizeError(cause), t));
    }
  };

  if (released !== null) {
    // La maquette `EscrowReleaseScreen` est un panneau centré, sans barre supérieure.
    return (
      <Screen
        footer={
          <View style={styles.footer}>
            <Button
              label={t('missions:quality.released.rate')}
              icon="star"
              size="lg"
              fullWidth
              onPress={() => onRate(requestId)}
            />
            <Button label={t('missions:quality.released.done')} variant="ghost" onPress={onDone} />
          </View>
        }
      >
        <View style={styles.success}>
          <View style={[styles.successMark, { backgroundColor: theme.tint.success }]}>
            <Icon name="check" size={40} tone="success" />
          </View>
          <Text variant="title" accessibilityRole="header" style={styles.centered}>
            {t('missions:quality.released.title')}
          </Text>
          <Text tone="muted" style={styles.centered}>
            {t('missions:quality.released.message', { amount: formatAmount(released) })}
          </Text>
        </View>
      </Screen>
    );
  }

  const loading = request.isPending || interventions.isPending || holds.isPending;

  return (
    <Screen
      title={t('missions:quality.title')}
      onBack={onBack}
      scroll
      footer={
        <View style={styles.footer}>
          {error ? <Snackbar message={error} tone="danger" /> : null}
          <Button
            label={t('missions:quality.validate')}
            icon="check"
            size="lg"
            fullWidth
            onPress={() => void validate()}
            loading={capture.isPending}
            disabled={hold === null}
          />
          <Button
            label={t('missions:quality.report')}
            icon="shield"
            variant="danger"
            onPress={() => onOpenDispute(requestId, technicianId)}
          />
        </View>
      }
    >
      {loading ? <StateView status="loading" /> : null}
      {request.isError ? (
        <StateView status="error" error={request.error} onRetry={() => void request.refetch()} />
      ) : null}
      {loading ? null : (
        <>
          <Text tone="muted">{t('missions:quality.hint')}</Text>
          <ReportCard report={report} />
          <PhotosCard photos={request.data?.photos ?? []} />
          <HoldCard hold={hold} />
        </>
      )}
    </Screen>
  );
}

function ReportCard({ report }: { report: Intervention | null }) {
  const { t } = useTranslation();
  if (report === null || !report.work_performed) {
    return (
      <Card>
        <SectionHeader title={t('missions:quality.reportSection')} />
        <Text tone="muted">{t('missions:quality.noReport')}</Text>
      </Card>
    );
  }
  return (
    <Card>
      <SectionHeader title={t('missions:quality.reportSection')} />
      <Text>{report.work_performed}</Text>
      {(report.materials_used ?? []).map((material) => (
        <ListItem key={material} label={material} icon="cog" />
      ))}
      {report.duration_hours != null ? (
        <ListItem label={formatHours(report.duration_hours)} icon="clock" />
      ) : null}
    </Card>
  );
}

function PhotosCard({ photos }: { photos: readonly string[] }) {
  const { t } = useTranslation();
  const storageUrl = useStorageUrl();
  if (photos.length === 0) return null;
  return (
    <Card>
      <SectionHeader title={t('missions:quality.photos')} />
      <AdaptiveGrid minTileWidth={96} gap={8}>
        {photos.map((path, index) => (
          <Image
            key={path}
            source={{ uri: storageUrl(path) }}
            accessibilityLabel={t('missions:quality.photo', { index: index + 1 })}
            style={styles.photo}
          />
        ))}
      </AdaptiveGrid>
    </Card>
  );
}

function HoldCard({ hold }: { hold: Hold | null }) {
  const { t } = useTranslation();
  return (
    <Card tone={hold === null ? 'muted' : 'primary'}>
      <View style={styles.holdRow}>
        <Icon name="shield" size={20} tone="primary" />
        <Text variant="subtitle" style={styles.holdTitle}>
          {hold === null
            ? t('missions:quality.noHold')
            : t('missions:quality.held', { amount: formatAmount(hold.amount) })}
        </Text>
      </View>
      {hold?.reason ? (
        <Text variant="caption" tone="muted">
          {hold.reason}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  footer: { gap: 10 },
  success: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  successMark: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: { textAlign: 'center' },
  photo: { width: '100%', aspectRatio: 1, borderRadius: 12 },
  holdRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  holdTitle: { flex: 1 },
});
