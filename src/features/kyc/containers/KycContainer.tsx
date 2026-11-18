import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { UploadFile } from '@/core/api';
import { describeError, normalizeError } from '@/core/errors';
import { pickImage } from '@/shared/media';
import { QueryGate, useToast } from '@/shared/ui';

import { useKycDocuments, useUploadKycDocument } from '../hooks/useKyc';
import { buildKycOverview, type KycItem } from '../model/kycOverview';
import type { KycDocumentType } from '../schemas/kycSchemas';
import {
  KYC_DOCUMENTS,
  KycCaptureView,
  KycStartView,
  KycStatusView,
  type KycDocument,
  type KycShot,
} from '../ui/KycViews';

type Phase = 'status' | 'start' | KycShot;

/** Type de justificatif déposé pour chaque prise de vue (recto et verso : pièce d'identité). */
const SHOT_TYPE: Record<KycShot, KycDocumentType> = {
  front: 'cni',
  back: 'cni',
  selfie: 'photo',
  casier: 'casier',
  cert: 'cert',
};

const SHOT_STEP: Record<KycShot, number> = { front: 2, back: 2, selfie: 3, casier: 4, cert: 4 };

const needs = (item: KycItem | undefined) =>
  item === undefined || item.status === 'missing' || item.status === 'rejected';

/**
 * Prises de vue restant à faire, dans l'ordre du parcours : pièce d'identité (recto, puis
 * verso si le document en a deux), selfie, puis justificatifs complémentaires.
 */
export function remainingShots(items: readonly KycItem[], sides: 1 | 2): KycShot[] {
  const byType = new Map(items.map((item) => [item.type, item]));
  const shots: KycShot[] = [];
  if (needs(byType.get('cni')))
    shots.push(...(sides === 2 ? (['front', 'back'] as const) : (['front'] as const)));
  if (needs(byType.get('photo'))) shots.push('selfie');
  if (needs(byType.get('casier'))) shots.push('casier');
  if (needs(byType.get('cert'))) shots.push('cert');
  return shots;
}

export interface KycContainerProps {
  onBack: () => void;
  /** Toutes les pièces déposées : poursuite du parcours d'installation. */
  onDone: () => void;
}

/** Vérification d'identité : choix du document, prises de vue déposées une à une, suivi. */
export function KycContainer({ onBack, onDone }: KycContainerProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const documents = useKycDocuments();
  const upload = useUploadKycDocument();
  const [phase, setPhase] = useState<Phase | null>(null);
  const [queue, setQueue] = useState<KycShot[]>([]);
  const [photo, setPhoto] = useState<UploadFile | null>(null);

  const items = documents.data ? buildKycOverview(documents.data) : [];
  const incomplete = remainingShots(items, 2).length > 0;
  const current: Phase =
    phase ?? (incomplete && items.every((item) => item.status === 'missing') ? 'start' : 'status');

  const begin = (document: KycDocument) => {
    const sides = KYC_DOCUMENTS.find((option) => option.key === document)?.sides ?? 2;
    const shots = remainingShots(items, sides);
    setQueue(shots);
    setPhoto(null);
    setPhase(shots[0] ?? 'status');
  };

  const capture = async (): Promise<UploadFile | null> => {
    // Les justificatifs papier peuvent déjà exister en photo ou en numérisation.
    const source = current === 'casier' || current === 'cert' ? 'library' : 'camera';
    const picked = await pickImage(source, { quality: 0.7 });
    if (picked.status === 'denied') {
      toast.show({ kind: 'warning', title: t('kyc:permissionDenied') });
    }
    return picked.status === 'picked' ? picked.file : null;
  };

  const next = async (shot: KycShot) => {
    if (!photo) return;
    try {
      await upload.mutateAsync({ type: SHOT_TYPE[shot], file: photo });
      const rest = queue.slice(queue.indexOf(shot) + 1);
      setPhoto(null);
      setPhase(rest[0] ?? 'status');
    } catch (error) {
      const appError = normalizeError(error);
      toast.show({
        kind: 'error',
        title: appError.fieldErrors.document?.[0] ?? describeError(appError, t),
      });
    }
  };

  return (
    <QueryGate queries={[documents]}>
      {() => {
        if (current === 'start') {
          return <KycStartView onSelect={begin} onBack={onBack} />;
        }
        if (current === 'status') {
          const rejected = items.some((item) => item.status === 'rejected');
          return (
            <KycStatusView
              status={rejected ? 'rejected' : 'pending'}
              items={items.map((item) => ({
                label: t(`kyc:types.${item.type}`),
                detail: item.rejectionReason ?? t(`kyc:statuses.${item.status}`),
                state:
                  item.status === 'approved'
                    ? 'done'
                    : item.status === 'pending'
                      ? 'active'
                      : 'todo',
              }))}
              onContinue={() => (incomplete ? setPhase('start') : onDone())}
            />
          );
        }
        const shot = current;
        return (
          <KycCaptureView
            shot={shot}
            step={SHOT_STEP[shot]}
            photo={photo}
            submitting={upload.isPending}
            onCapture={capture}
            onPhoto={setPhoto}
            onNext={() => void next(shot)}
            onBack={() => {
              setPhoto(null);
              setPhase('status');
            }}
          />
        );
      }}
    </QueryGate>
  );
}
