import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';
import { Badge, Button, Card, Screen, StateView, Text, type BadgeTone } from '@/shared/components';
import { pickImage, type ImageSource } from '@/shared/media';

import { useKycDocuments, useUploadKycDocument } from '../hooks/useKyc';
import { buildKycOverview, type KycItem, type KycItemStatus } from '../model/kycOverview';
import type { KycDocumentType } from '../schemas/kycSchemas';

const TONE_BY_STATUS: Record<KycItemStatus, BadgeTone> = {
  missing: 'neutral',
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

type Feedback = { tone: 'primary' | 'danger'; text: string };

/** Justificatifs d'identité : état de chaque pièce et envoi des pièces manquantes ou refusées. */
export function KycScreen() {
  const { t } = useTranslation();
  const documents = useKycDocuments();
  const upload = useUploadKycDocument();
  const [uploadingType, setUploadingType] = useState<KycDocumentType | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const send = async (type: KycDocumentType, source: ImageSource) => {
    setFeedback(null);
    const picked = await pickImage(source);
    if (picked.status === 'denied') {
      setFeedback({ tone: 'danger', text: t('kyc:permissionDenied') });
      return;
    }
    if (picked.status === 'canceled') return;
    setUploadingType(type);
    try {
      await upload.mutateAsync({ type, file: picked.file });
      setFeedback({ tone: 'primary', text: t('kyc:uploaded') });
    } catch (error) {
      const appError = normalizeError(error);
      setFeedback({
        tone: 'danger',
        text: appError.fieldErrors.document?.[0] ?? describeError(appError, t),
      });
    } finally {
      setUploadingType(null);
    }
  };

  const renderItem = (item: KycItem) => {
    const typeLabel = t(`kyc:types.${item.type}`);
    const canUpload = item.status === 'missing' || item.status === 'rejected';
    return (
      <Card key={item.type}>
        <Text variant="subtitle">{typeLabel}</Text>
        <Badge label={t(`kyc:statuses.${item.status}`)} tone={TONE_BY_STATUS[item.status]} />
        {item.rejectionReason ? (
          <Text tone="danger">{t('kyc:rejectionReason', { reason: item.rejectionReason })}</Text>
        ) : null}
        {canUpload ? (
          <>
            <Button
              label={t('kyc:fromCamera')}
              accessibilityLabel={`${t('kyc:fromCamera')} : ${typeLabel}`}
              onPress={() => void send(item.type, 'camera')}
              loading={uploadingType === item.type}
              disabled={uploadingType !== null}
            />
            <Button
              label={t('kyc:fromLibrary')}
              accessibilityLabel={`${t('kyc:fromLibrary')} : ${typeLabel}`}
              onPress={() => void send(item.type, 'library')}
              disabled={uploadingType !== null}
              variant="secondary"
            />
          </>
        ) : null}
      </Card>
    );
  };

  return (
    <Screen title={t('kyc:title')} scroll>
      <Text tone="muted">{t('kyc:hint')}</Text>
      {feedback ? <Text tone={feedback.tone}>{feedback.text}</Text> : null}
      {documents.isPending ? <StateView status="loading" /> : null}
      {documents.isError ? (
        <StateView
          status="error"
          error={documents.error}
          onRetry={() => void documents.refetch()}
        />
      ) : null}
      {documents.isSuccess ? buildKycOverview(documents.data).map(renderItem) : null}
    </Screen>
  );
}
