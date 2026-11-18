import { useTranslation } from 'react-i18next';
import { Image, View } from 'react-native';

import type { UploadFile } from '@/core/api';
import { useTheme } from '@/core/theme';
import {
  BackButton,
  Button,
  Card,
  Icon,
  PhaseBar,
  Pill,
  Screen,
  Text,
  type IconName,
} from '@/shared/ui';

export type KycDocument = 'cni' | 'passport' | 'permit';

export interface KycDocumentOption {
  key: KycDocument;
  icon: IconName;
  /** Recto et verso, ou page unique. */
  sides: 1 | 2;
  recommended?: boolean;
}

export const KYC_DOCUMENTS: readonly KycDocumentOption[] = [
  { key: 'cni', icon: 'badge', sides: 2, recommended: true },
  { key: 'passport', icon: 'file', sides: 1 },
  { key: 'permit', icon: 'wallet', sides: 2 },
];

function StepHeader({
  step,
  count,
  label,
  onBack,
}: {
  step: number;
  count: number;
  label: string;
  onBack: () => void;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingTop: 8,
      }}
    >
      <BackButton onPress={onBack} />
      <View style={{ flex: 1, gap: 4 }}>
        <Text
          variant="caption"
          tone="muted"
          style={{ fontSize: 11, fontFamily: theme.fontFamily.body }}
        >
          {label}
        </Text>
        <PhaseBar phase={step} count={count} />
      </View>
    </View>
  );
}

export interface KycStartViewProps {
  onSelect: (document: KycDocument) => void;
  onBack: () => void;
}

/** Choix de la pièce d'identité (maquette `KYCStartScreen`). */
export function KycStartView({ onSelect, onBack }: KycStartViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Screen testID="kyc-document">
      <StepHeader
        step={1}
        count={4}
        label={t('kyc:flow.step', { step: 1, count: 4 })}
        onBack={onBack}
      />
      <View style={{ paddingHorizontal: 24, paddingTop: 20, gap: 12 }}>
        <Text
          variant="headline"
          accessibilityRole="header"
          style={{ fontSize: 26, lineHeight: 30 }}
        >
          {t('kyc:flow.startTitle')}
        </Text>
        <Text
          variant="label"
          tone="muted"
          style={{ fontFamily: theme.fontFamily.body, marginBottom: 8 }}
        >
          {t('kyc:flow.startHint')}
        </Text>
        {KYC_DOCUMENTS.map((document) => (
          <Card
            key={document.key}
            padding={16}
            onPress={() => onSelect(document.key)}
            accessibilityLabel={t(`kyc:flow.documents.${document.key}.label`)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: theme.tint.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name={document.icon} size={22} tone="primary" />
              </View>
              <View style={{ flex: 1 }}>
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
                >
                  <Text variant="bodyStrong">{t(`kyc:flow.documents.${document.key}.label`)}</Text>
                  {document.recommended ? (
                    <Pill label={t('kyc:flow.recommended')} tone="success" size="sm" />
                  ) : null}
                </View>
                <Text variant="caption" tone="muted">
                  {t(`kyc:flow.documents.${document.key}.sides`)}
                </Text>
              </View>
              <Icon name="chevronR" size={16} tone="muted" />
            </View>
          </Card>
        ))}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <Icon name="shield" size={14} tone="success" />
          <Text variant="caption" tone="muted" style={{ flex: 1 }}>
            {t('kyc:flow.privacy')}
          </Text>
        </View>
      </View>
    </Screen>
  );
}

/** Recto, verso, selfie, puis les justificatifs complémentaires exigés par le serveur. */
export type KycShot = 'front' | 'back' | 'selfie' | 'casier' | 'cert';

export interface KycCaptureViewProps {
  shot: KycShot;
  /** Étape du parcours (2 pour le document, 3 pour le selfie). */
  step: number;
  photo: UploadFile | null;
  /** Envoi de la prise de vue retenue en cours. */
  submitting?: boolean;
  onCapture: () => Promise<UploadFile | null>;
  onPhoto: (file: UploadFile | null) => void;
  onNext: () => void;
  onBack: () => void;
}

/** Prise de vue du document ou du selfie (maquettes `KYCScanScreen`, `KYCSelfieScreen`). */
export function KycCaptureView({
  shot,
  step,
  photo,
  submitting = false,
  onCapture,
  onPhoto,
  onNext,
  onBack,
}: KycCaptureViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const selfie = shot === 'selfie';

  return (
    <Screen
      testID="kyc-capture"
      footer={
        photo ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Button
                label={t('kyc:flow.retake')}
                variant="ghost"
                size="lg"
                full
                disabled={submitting}
                onPress={() => onPhoto(null)}
              />
            </View>
            <View style={{ flex: 2 }}>
              <Button
                label={t('kyc:flow.useShot')}
                iconRight="arrowR"
                size="lg"
                full
                loading={submitting}
                onPress={onNext}
              />
            </View>
          </View>
        ) : (
          <Button
            label={t(selfie ? 'kyc:flow.takeSelfie' : 'kyc:flow.takePhoto')}
            icon="camera"
            size="lg"
            full
            onPress={() => void onCapture().then((file) => file && onPhoto(file))}
          />
        )
      }
    >
      <StepHeader
        step={step}
        count={4}
        label={t('kyc:flow.captureStep', { step, count: 4, shot: t(`kyc:flow.shots.${shot}`) })}
        onBack={onBack}
      />
      <View style={{ alignItems: 'center', paddingHorizontal: 24, paddingTop: 24, gap: 18 }}>
        <View
          style={{
            width: selfie ? 240 : '100%',
            height: selfie ? 300 : 210,
            borderRadius: selfie ? 120 : 18,
            borderWidth: 3,
            borderStyle: photo ? 'solid' : 'dashed',
            borderColor: photo ? theme.colors.success : theme.colors.primary,
            backgroundColor: theme.colors.surfaceMuted,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {photo ? (
            <Image
              source={{ uri: photo.uri }}
              accessibilityLabel={t('kyc:flow.preview')}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <Icon name={selfie ? 'user' : 'badge'} size={64} tone="muted" />
          )}
        </View>
        <Text variant="title" align="center" accessibilityRole="header">
          {t(
            photo
              ? `kyc:flow.captured.${selfie ? 'selfie' : 'document'}`
              : `kyc:flow.instructions.${shot}`,
          )}
        </Text>
        <Text
          variant="label"
          tone="muted"
          align="center"
          style={{ fontFamily: theme.fontFamily.body, maxWidth: 300 }}
        >
          {t(selfie ? 'kyc:flow.selfieTip' : 'kyc:flow.documentTip')}
        </Text>
      </View>
    </Screen>
  );
}

export interface KycStatusViewProps {
  status: 'pending' | 'rejected';
  /** Étapes de l'examen (en cours) ou motifs du refus. */
  items: readonly {
    label: string;
    detail: string;
    state?: 'done' | 'active' | 'todo';
    icon?: IconName;
  }[];
  onContinue: () => void;
  onSupport?: () => void;
}

/** Vérification en cours ou refusée (maquettes `KYCPendingScreen`, `KYCRejectedScreen`). */
export function KycStatusView({ status, items, onContinue, onSupport }: KycStatusViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const rejected = status === 'rejected';
  const color = rejected ? theme.colors.danger : theme.colors.warning;

  return (
    <Screen
      testID={`kyc-${status}`}
      footer={
        <View style={{ gap: 8 }}>
          <Button
            label={t(rejected ? 'kyc:flow.resubmit' : 'kyc:flow.continueLimited')}
            size="lg"
            full
            onPress={onContinue}
          />
          {rejected && onSupport ? (
            <Button label={t('kyc:flow.support')} variant="ghost" full onPress={onSupport} />
          ) : null}
        </View>
      }
    >
      <View style={{ alignItems: 'center', paddingHorizontal: 24, paddingTop: 40, gap: 14 }}>
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: `${color}1A`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={rejected ? 'close' : 'clock'} size={44} color={color} />
        </View>
        {rejected ? null : (
          <Pill label={t('kyc:flow.underReview')} tone="warning" size="sm" icon="clock" />
        )}
        <Text
          variant="headline"
          align="center"
          accessibilityRole="header"
          style={{ fontSize: 26, lineHeight: 30 }}
        >
          {t(rejected ? 'kyc:flow.rejectedTitle' : 'kyc:flow.pendingTitle')}
        </Text>
        <Text
          variant="label"
          tone="muted"
          align="center"
          style={{ fontFamily: theme.fontFamily.body, maxWidth: 300 }}
        >
          {t(rejected ? 'kyc:flow.rejectedBody' : 'kyc:flow.pendingBody')}
        </Text>
      </View>
      <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
        {rejected ? (
          <Text variant="eyebrow" tone="muted" style={{ letterSpacing: 1, marginBottom: 8 }}>
            {t('kyc:flow.reasons')}
          </Text>
        ) : null}
        <Card padding={0}>
          {items.map((item, index) => (
            <View
              key={item.label}
              accessible
              accessibilityLabel={`${item.label}. ${item.detail}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                padding: 14,
                borderTopWidth: index === 0 ? 0 : 1,
                borderTopColor: theme.colors.divider,
              }}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: rejected
                    ? theme.tint.danger
                    : item.state === 'done'
                      ? theme.colors.success
                      : item.state === 'active'
                        ? theme.tint.warning
                        : theme.colors.surfaceHigh,
                }}
              >
                <Icon
                  name={
                    rejected
                      ? (item.icon ?? 'info')
                      : item.state === 'done'
                        ? 'check'
                        : item.state === 'active'
                          ? 'clock'
                          : 'minus'
                  }
                  size={14}
                  color={
                    rejected
                      ? theme.colors.danger
                      : item.state === 'done'
                        ? '#ffffff'
                        : item.state === 'active'
                          ? theme.colors.warning
                          : theme.colors.textMuted
                  }
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  variant="labelStrong"
                  tone={!rejected && item.state === 'todo' ? 'muted' : 'default'}
                >
                  {item.label}
                </Text>
                <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
                  {item.detail}
                </Text>
              </View>
            </View>
          ))}
        </Card>
      </View>
    </Screen>
  );
}
