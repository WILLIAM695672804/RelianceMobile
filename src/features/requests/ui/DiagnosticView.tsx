import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useTheme } from '@/core/theme';
import { formatAmount } from '@/shared/format';
import { totalsOf, type LineItem } from '@/shared/model';
import {
  Avatar,
  Button,
  Card,
  DetailHeader,
  Field,
  ImagePlaceholder,
  Pill,
  Screen,
  SectionLabel,
  Text,
} from '@/shared/ui';

export interface DiagnosticReport {
  reference: string;
  phaseLabel: string;
  technician: { name: string; color?: string };
  performedAt: string;
  findings: string;
  photos: readonly string[];
  recommendations: readonly string[];
  lines: readonly LineItem[];
  /** Diagnostic déjà réglé, rappelé à côté de l'estimation. */
  diagnosticFee: number | null;
}

export interface DiagnosticViewProps {
  /** `client` : lecture et décision ; `technician` : rédaction et envoi. */
  mode: 'client' | 'technician';
  report: DiagnosticReport;
  submitting?: boolean;
  onBack: () => void;
  /** Client : demander un devis ; technicien : envoyer le diagnostic (constat saisi). */
  onPrimary: (findings: string) => void;
  /** Client seulement : refuser le diagnostic ; absent, le bouton n'est pas proposé. */
  onReject?: () => void;
}

/** Rapport de diagnostic (maquette `DiagnosticReportScreen`), présentation pure. */
export function DiagnosticView({
  mode,
  report,
  submitting = false,
  onBack,
  onPrimary,
  onReject,
}: DiagnosticViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const writing = mode === 'technician';
  const [findings, setFindings] = useState(report.findings);
  const { subtotal } = totalsOf(report.lines);

  return (
    <Screen
      testID="diagnostic"
      footer={
        writing ? (
          <Button
            label={t('requests:diagnosticView.send')}
            iconRight="arrowR"
            size="lg"
            full
            loading={submitting}
            disabled={findings.trim().length === 0}
            onPress={() => onPrimary(findings.trim())}
          />
        ) : (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {onReject ? (
              <View style={{ flex: 1 }}>
                <Button
                  label={t('requests:diagnosticView.reject')}
                  variant="ghost"
                  size="lg"
                  full
                  onPress={onReject}
                />
              </View>
            ) : null}
            <View style={{ flex: 2 }}>
              <Button
                label={t('requests:diagnosticView.askQuote')}
                iconRight="arrowR"
                size="lg"
                full
                loading={submitting}
                onPress={() => onPrimary(report.findings)}
              />
            </View>
          </View>
        )
      }
    >
      <DetailHeader
        eyebrow={report.reference}
        title={t(
          writing ? 'requests:diagnosticView.writeTitle' : 'requests:diagnosticView.readTitle',
        )}
        onBack={onBack}
        trailing={<Pill label={report.phaseLabel} tone="warning" icon="clock" />}
      />
      <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 18 }}>
        <Card padding={14}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar name={report.technician.name} color={report.technician.color} size={44} />
            <View style={{ flex: 1 }}>
              <Text variant="labelStrong">{report.technician.name}</Text>
              <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
                {report.performedAt}
              </Text>
            </View>
            <Pill label={t('requests:diagnosticView.done')} tone="success" size="sm" icon="check" />
          </View>
        </Card>

        <View>
          <SectionLabel icon="search" label={t('requests:diagnosticView.findings')} />
          {writing ? (
            <Field
              label={t('requests:diagnosticView.findings')}
              value={findings}
              onChangeText={setFindings}
              multiline
            />
          ) : (
            <Text
              variant="label"
              tone="muted"
              style={{ lineHeight: 20, fontFamily: theme.fontFamily.body }}
            >
              {report.findings}
            </Text>
          )}
        </View>

        {report.photos.length > 0 ? (
          <View>
            <SectionLabel icon="camera" label={t('requests:diagnosticView.photos')} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {report.photos.map((photo) => (
                <View key={photo} style={{ flex: 1 }}>
                  <ImagePlaceholder label={photo} height={90} radius={10} />
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {report.recommendations.length > 0 ? (
          <View>
            <SectionLabel icon="wrench" label={t('requests:diagnosticView.recommendations')} />
            <View style={{ gap: 4 }}>
              {report.recommendations.map((item) => (
                <Text
                  key={item}
                  variant="label"
                  tone="muted"
                  style={{ lineHeight: 20, fontFamily: theme.fontFamily.body }}
                >
                  • {item}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        {report.lines.length > 0 ? (
          <View>
            <SectionLabel icon="file" label={t('requests:diagnosticView.estimate')} />
            <View style={{ gap: 6 }}>
              {report.lines.map((line) => (
                <View
                  key={line.label}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surface,
                  }}
                >
                  <Text variant="label" style={{ flex: 1, fontFamily: theme.fontFamily.body }}>
                    {line.label}
                  </Text>
                  {line.detail ? (
                    <Text variant="caption" tone="muted" style={{ fontSize: 11, marginRight: 12 }}>
                      {line.detail}
                    </Text>
                  ) : null}
                  <Text variant="labelStrong" style={{ fontFamily: theme.fontFamily.display }}>
                    {formatAmount(line.quantity * line.unitPrice)}
                  </Text>
                </View>
              ))}
            </View>
            <Card padding={14} style={{ marginTop: 14, borderColor: `${theme.colors.primary}33` }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View>
                  <Text variant="eyebrow" tone="muted" style={{ letterSpacing: 1 }}>
                    {t('requests:diagnosticView.total')}
                  </Text>
                  <Text variant="title" style={{ marginTop: 2 }}>
                    {formatAmount(subtotal)}
                  </Text>
                </View>
                {report.diagnosticFee != null ? (
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
                      {t('requests:diagnosticView.fee')}
                    </Text>
                    <Text variant="labelStrong">
                      {t('requests:diagnosticView.paid', {
                        amount: formatAmount(report.diagnosticFee),
                      })}
                    </Text>
                  </View>
                ) : null}
              </View>
            </Card>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}
