import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useTheme } from '@/core/theme';
import { formatAmount } from '@/shared/format';
import {
  Avatar,
  Banner,
  Button,
  Card,
  CheckRow,
  DetailHeader,
  Icon,
  ImagePlaceholder,
  Pill,
  RadioRow,
  Screen,
  SectionLabel,
  Text,
} from '@/shared/ui';

export interface WorkCheck {
  key: string;
  label: string;
  hint?: string;
}

export interface ValidationViewProps {
  technicianName: string;
  phaseLabel: string;
  finishedAt: string;
  photos: { before: string; after: string } | null;
  checks: readonly WorkCheck[];
  /** Montant libéré vers le technicien à la validation. */
  releaseAmount: number;
  submitting?: boolean;
  onBack: () => void;
  onValidate: () => void;
  onDispute: () => void;
}

/** Validation des travaux par le client (maquette `ValidationScreen`), présentation pure. */
export function ValidationView(props: ValidationViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(props.checks.map((check) => [check.key, true])),
  );
  const allOk = props.checks.every((check) => checked[check.key]);

  return (
    <Screen
      testID="validation-travaux"
      footer={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Button
              label={t('missions:completion.dispute')}
              variant="ghost"
              size="lg"
              full
              onPress={props.onDispute}
            />
          </View>
          <View style={{ flex: 2 }}>
            <Button
              label={t('missions:completion.validate')}
              size="lg"
              full
              disabled={!allOk}
              loading={props.submitting}
              onPress={props.onValidate}
            />
          </View>
        </View>
      }
    >
      <DetailHeader
        eyebrow={props.phaseLabel}
        title={t('missions:completion.title')}
        onBack={props.onBack}
      />
      <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            padding: 16,
            borderRadius: 18,
            backgroundColor: theme.colors.success,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="check" size={28} strokeWidth={2.5} color="#ffffff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="eyebrow" style={{ color: '#ffffff', opacity: 0.9, letterSpacing: 1.2 }}>
              {t('missions:completion.end')}
            </Text>
            <Text
              variant="section"
              style={{ color: '#ffffff', fontFamily: theme.fontFamily.display }}
            >
              {t('missions:completion.finished', { name: props.technicianName })}
            </Text>
            <Text variant="caption" style={{ color: '#ffffff', opacity: 0.85, fontSize: 11 }}>
              {props.finishedAt}
            </Text>
          </View>
        </View>

        {props.photos ? (
          <View>
            <SectionLabel label={t('missions:completion.beforeAfter')} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(
                [
                  ['before', props.photos.before, 'primary'],
                  ['after', props.photos.after, 'blue'],
                ] as const
              ).map(([key, label, tone]) => (
                <View key={key} style={{ flex: 1, gap: 4 }}>
                  <ImagePlaceholder label={label} height={130} radius={12} tone={tone} />
                  <Text variant="caption" tone="muted" align="center" style={{ fontSize: 10 }}>
                    {t(`missions:completion.${key}`)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View>
          <SectionLabel label={t('missions:completion.checks')} />
          <Card padding={0}>
            {props.checks.map((check, index) => (
              <CheckRow
                key={check.key}
                label={check.label}
                hint={check.hint}
                checked={Boolean(checked[check.key])}
                divider={index > 0}
                onPress={() =>
                  setChecked((current) => ({ ...current, [check.key]: !current[check.key] }))
                }
              />
            ))}
          </Card>
        </View>

        <Banner
          tone="success"
          icon="shield"
          message={t('missions:completion.release', {
            amount: formatAmount(props.releaseAmount),
            name: props.technicianName,
          })}
        />
      </View>
    </Screen>
  );
}

export interface MissionClosedViewProps {
  technicianName: string;
  reference: string;
  summary: string;
  amount: number;
  onRate: () => void;
  onInvoice: () => void;
  onHome: () => void;
}

const CONFETTI = Array.from({ length: 12 }, (_, index) => index);

/** Fonds libérés, mission close (maquette `EscrowReleaseScreen`), présentation pure. */
export function MissionClosedView(props: MissionClosedViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = [
    theme.colors.danger,
    theme.colors.primary,
    theme.colors.warning,
    theme.colors.success,
  ];

  return (
    <Screen
      testID="mission-close"
      scroll={false}
      footer={
        <View style={{ gap: 8 }}>
          <Button
            label={t('missions:completion.rate')}
            icon="star"
            size="lg"
            full
            onPress={props.onRate}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Button
                label={t('missions:completion.invoice')}
                icon="file"
                variant="ghost"
                full
                onPress={props.onInvoice}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label={t('missions:completion.home')}
                variant="ghost"
                full
                onPress={props.onHome}
              />
            </View>
          </View>
        </View>
      }
    >
      <View
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        {CONFETTI.map((index) => (
          <View
            key={index}
            style={{
              position: 'absolute',
              left: `${(index * 37) % 100}%`,
              top: `${(index * 23) % 60}%`,
              width: 6 + (index % 3) * 3,
              height: 6 + (index % 3) * 3,
              borderRadius: index % 2 ? 99 : 2,
              backgroundColor: colors[index % 4],
              opacity: 0.3,
              transform: [{ rotate: `${index * 30}deg` }],
            }}
          />
        ))}
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 }}>
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: theme.colors.success,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            boxShadow: `0px 20px 50px ${theme.colors.success}55`,
          }}
        >
          <Icon name="check" size={56} strokeWidth={3} color="#ffffff" />
        </View>
        <Text variant="eyebrow" tone="primary" style={{ letterSpacing: 2, marginBottom: 10 }}>
          {t('missions:completion.closedEyebrow')}
        </Text>
        <Text variant="headline" align="center" accessibilityRole="header">
          {t('missions:completion.closedTitle')}
        </Text>
        <Text
          variant="body"
          tone="muted"
          align="center"
          style={{ marginTop: 12, maxWidth: 280, fontSize: 14 }}
        >
          {t('missions:completion.closedBody', {
            amount: formatAmount(props.amount),
            name: props.technicianName,
          })}
        </Text>
        <Card padding={16} style={{ marginTop: 28, alignSelf: 'stretch' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar name={props.technicianName} size={44} />
            <View style={{ flex: 1 }}>
              <Text variant="caption" tone="muted">
                {props.reference}
              </Text>
              <Text variant="bodyStrong" style={{ fontSize: 14 }}>
                {props.summary}
              </Text>
            </View>
            <Text
              variant="bodyStrong"
              tone="success"
              style={{ fontFamily: theme.fontFamily.display, fontSize: 16 }}
            >
              +{formatAmount(props.amount).replace(/\s?FCFA$/, '')}
            </Text>
          </View>
        </Card>
      </View>
    </Screen>
  );
}

export interface CancelViewProps {
  /** Auteur de l'annulation : le technicien voit les libellés de sa mission. */
  viewer?: 'client' | 'technician';
  /** Interlocuteur rappelé en tête (le technicien pour le client, le client sinon). */
  technician: { name: string; detail: string; statusLabel: string };
  reasons: readonly { key: string; label: string }[];
  /** Montant en séquestre et frais ; absents, le détail du remboursement n'est pas affiché. */
  refund: { held: number; fee: number } | null;
  submitting?: boolean;
  onBack: () => void;
  onConfirm: (reason: string) => void;
}

/** Annulation en deux temps : motif puis confirmation (maquette `CancelScreen`). */
export function CancelView(props: CancelViewProps) {
  const { t } = useTranslation();
  const title = t(
    props.viewer === 'technician' ? 'missions:cancel.title' : 'missions:cancelView.title',
  );
  const theme = useTheme();
  const [step, setStep] = useState<'reason' | 'confirm'>('reason');
  const [reason, setReason] = useState<string | null>(null);

  if (step === 'confirm' && reason) {
    return (
      <Screen
        testID="annulation"
        footer={
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Button
                label={t('missions:cancelView.keep')}
                variant="ghost"
                size="lg"
                full
                onPress={() => setStep('reason')}
              />
            </View>
            <View style={{ flex: 2 }}>
              <Button
                label={t('missions:cancelView.confirm')}
                size="lg"
                full
                loading={props.submitting}
                onPress={() => props.onConfirm(reason)}
              />
            </View>
          </View>
        }
      >
        <DetailHeader title={title} onBack={() => setStep('reason')} />
        <View style={{ paddingHorizontal: 24, paddingTop: 20, gap: 14 }}>
          <Text
            variant="headline"
            accessibilityRole="header"
            style={{ fontSize: 26, lineHeight: 30 }}
          >
            {t('missions:cancelView.confirmTitle')}
          </Text>
          <Text variant="body" tone="muted" style={{ fontSize: 14 }}>
            {t(
              props.viewer === 'technician'
                ? 'missions:cancel.confirmMessage'
                : 'missions:cancelView.confirmBody',
            )}
          </Text>
          {props.refund ? (
            <Card padding={0}>
              <View
                style={{
                  padding: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.divider,
                }}
              >
                <SectionLabel label={t('missions:cancelView.refundTitle')} />
              </View>
              <RefundRow
                label={t('missions:cancelView.held')}
                value={formatAmount(props.refund.held)}
              />
              <RefundRow
                label={t('missions:cancelView.fee')}
                value={`− ${formatAmount(props.refund.fee)}`}
                danger
              />
              <View style={{ height: 1, backgroundColor: theme.colors.divider }} />
              <RefundRow
                label={t('missions:cancelView.refunded')}
                value={formatAmount(props.refund.held - props.refund.fee)}
                strong
              />
            </Card>
          ) : null}
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      testID="annulation"
      footer={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Button
              label={t('missions:cancelView.back')}
              variant="ghost"
              size="lg"
              full
              onPress={props.onBack}
            />
          </View>
          <View style={{ flex: 2 }}>
            <Button
              label={t('missions:cancelView.continue')}
              size="lg"
              full
              disabled={!reason}
              onPress={() => setStep('confirm')}
            />
          </View>
        </View>
      }
    >
      <DetailHeader title={title} onBack={props.onBack} />
      <View style={{ paddingHorizontal: 24, paddingTop: 20, gap: 12 }}>
        <Card padding={12}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar name={props.technician.name} size={44} />
            <View style={{ flex: 1 }}>
              <Text variant="labelStrong">{props.technician.name}</Text>
              <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
                {props.technician.detail}
              </Text>
            </View>
            <Pill label={props.technician.statusLabel} tone="warning" size="sm" />
          </View>
        </Card>
        <Text variant="title" accessibilityRole="header" style={{ marginTop: 8 }}>
          {t('missions:cancelView.why')}
        </Text>
        <Text
          variant="label"
          tone="muted"
          style={{ fontFamily: theme.fontFamily.body, marginBottom: 6 }}
        >
          {t('missions:cancelView.whyHint')}
        </Text>
        <View accessibilityRole="radiogroup" style={{ gap: 8 }}>
          {props.reasons.map((item) => (
            <RadioRow
              key={item.key}
              label={item.label}
              selected={reason === item.key}
              onPress={() => setReason(item.key)}
            />
          ))}
        </View>
        {props.refund && props.refund.fee > 0 ? (
          <Banner
            tone="warning"
            icon="clock"
            message={t('missions:cancelView.feeNotice', { fee: formatAmount(props.refund.fee) })}
          />
        ) : null}
      </View>
    </Screen>
  );
}

function RefundRow({
  label,
  value,
  danger = false,
  strong = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
  strong?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    >
      <Text
        variant={strong ? 'labelStrong' : 'label'}
        style={{ fontFamily: strong ? theme.fontFamily.bodyBold : theme.fontFamily.body }}
      >
        {label}
      </Text>
      <Text
        variant="labelStrong"
        tone={danger ? 'danger' : strong ? 'primary' : 'default'}
        style={{ fontFamily: theme.fontFamily.display, fontSize: strong ? 16 : 13 }}
      >
        {value}
      </Text>
    </View>
  );
}
