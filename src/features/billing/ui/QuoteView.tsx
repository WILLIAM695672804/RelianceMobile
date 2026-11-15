import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/core/theme';
import { formatAmount } from '@/shared/format';
import { totalsOf, type LineItem } from '@/shared/model';
import {
  Avatar,
  Banner,
  Button,
  Card,
  DetailHeader,
  Icon,
  Screen,
  SectionLabel,
  Text,
} from '@/shared/ui';

export interface QuoteDocument {
  reference: string;
  /** Échéance de validité, déjà formulée (« 24 avril à 14 h 32 »). */
  validUntil: string | null;
  issuer: { name: string; role: string; color?: string };
  recipient: { name: string; place: string };
  lines: readonly LineItem[];
  /** Taux des frais de plateforme (0,05 pour 5 %). */
  feeRate: number;
  conditions: readonly string[];
}

export interface QuoteViewProps {
  quote: QuoteDocument;
  submitting?: 'accept' | 'reject' | null;
  onBack: () => void;
  onAccept: () => void;
  onReject: () => void;
  onShare?: () => void;
}

/** Devis formel : lignes, totaux, conditions, acceptation (maquette `QuoteScreen`). */
export function QuoteView({
  quote,
  submitting = null,
  onBack,
  onAccept,
  onReject,
  onShare,
}: QuoteViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [agreed, setAgreed] = useState(false);
  const totals = totalsOf(quote.lines, quote.feeRate);

  return (
    <Screen
      testID="devis"
      footer={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Button
              label={t('billing:quoteView.reject')}
              variant="ghost"
              size="lg"
              full
              loading={submitting === 'reject'}
              disabled={submitting != null}
              onPress={onReject}
            />
          </View>
          <View style={{ flex: 2 }}>
            <Button
              label={t('billing:quoteView.accept')}
              icon="shield"
              size="lg"
              full
              disabled={!agreed || submitting != null}
              loading={submitting === 'accept'}
              onPress={onAccept}
            />
          </View>
        </View>
      }
    >
      <DetailHeader
        eyebrow={quote.reference}
        title={t('billing:quoteView.title')}
        onBack={onBack}
        trailing={
          onShare ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('billing:quoteView.share')}
              onPress={onShare}
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.colors.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="upload" size={16} />
            </Pressable>
          ) : undefined
        }
      />
      <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 14 }}>
        {quote.validUntil ? (
          <Banner
            tone="warning"
            icon="clock"
            message={t('billing:quoteView.validity', { date: quote.validUntil })}
          />
        ) : null}

        <Card padding={14}>
          <View style={{ flexDirection: 'row', gap: 14 }}>
            <View style={{ flex: 1 }}>
              <Text
                variant="eyebrow"
                tone="muted"
                style={{ letterSpacing: 1, fontSize: 10, marginBottom: 6 }}
              >
                {t('billing:quoteView.from')}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Avatar name={quote.issuer.name} color={quote.issuer.color} size={28} />
                <View style={{ flex: 1 }}>
                  <Text
                    variant="caption"
                    style={{ color: theme.colors.text, fontFamily: theme.fontFamily.bodySemiBold }}
                  >
                    {quote.issuer.name}
                  </Text>
                  <Text variant="caption" tone="muted" style={{ fontSize: 10 }}>
                    {quote.issuer.role}
                  </Text>
                </View>
              </View>
            </View>
            <View style={{ width: 1, backgroundColor: theme.colors.divider }} />
            <View style={{ flex: 1 }}>
              <Text
                variant="eyebrow"
                tone="muted"
                style={{ letterSpacing: 1, fontSize: 10, marginBottom: 6 }}
              >
                {t('billing:quoteView.to')}
              </Text>
              <Text
                variant="caption"
                style={{ color: theme.colors.text, fontFamily: theme.fontFamily.bodySemiBold }}
              >
                {quote.recipient.name}
              </Text>
              <Text variant="caption" tone="muted" style={{ fontSize: 10 }}>
                {quote.recipient.place}
              </Text>
            </View>
          </View>
        </Card>

        <View>
          <SectionLabel label={t('billing:quoteView.detail')} />
          <Card padding={0}>
            {quote.lines.map((line, index) => (
              <View
                key={line.label}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 14,
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderTopColor: theme.colors.divider,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text variant="labelStrong">{line.label}</Text>
                  {line.detail ? (
                    <Text variant="caption" tone="muted" style={{ fontSize: 10, marginTop: 2 }}>
                      {line.detail}
                    </Text>
                  ) : null}
                </View>
                <Text variant="caption" tone="muted" style={{ fontSize: 11, marginRight: 14 }}>
                  ×{line.quantity}
                </Text>
                <Text
                  variant="labelStrong"
                  style={{ fontFamily: theme.fontFamily.display, minWidth: 80, textAlign: 'right' }}
                >
                  {formatAmount(line.unitPrice)}
                </Text>
              </View>
            ))}
          </Card>
        </View>

        <Card padding={14}>
          <TotalRow label={t('billing:quoteView.subtotal')} value={formatAmount(totals.subtotal)} />
          {totals.fee > 0 ? (
            <TotalRow
              label={t('billing:quoteView.fee', { rate: Math.round(quote.feeRate * 100) })}
              value={formatAmount(totals.fee)}
              muted
            />
          ) : null}
          <View style={{ height: 1, backgroundColor: theme.colors.divider, marginVertical: 8 }} />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <Text variant="bodyStrong" style={{ fontSize: 14 }}>
              {t('billing:quoteView.total')}
            </Text>
            <Text variant="headline" tone="primary" style={{ fontSize: 24, lineHeight: 28 }}>
              {formatAmount(totals.total)}
            </Text>
          </View>
        </Card>

        {quote.conditions.length > 0 ? (
          <Card padding={14}>
            <SectionLabel label={t('billing:quoteView.conditions')} />
            {quote.conditions.map((condition) => (
              <Text
                key={condition}
                variant="caption"
                tone="muted"
                style={{ lineHeight: 19, fontFamily: theme.fontFamily.body }}
              >
                • {condition}
              </Text>
            ))}
          </Card>
        ) : null}

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agreed }}
          accessibilityLabel={t('billing:quoteView.agree')}
          onPress={() => setAgreed((value) => !value)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48 }}
        >
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              borderWidth: 1.5,
              borderColor: agreed ? theme.colors.primary : theme.colors.outlineVariant,
              backgroundColor: agreed ? theme.colors.primary : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {agreed ? <Icon name="check" size={13} strokeWidth={3} tone="onPrimary" /> : null}
          </View>
          <Text variant="label" style={{ flex: 1, fontFamily: theme.fontFamily.body }}>
            {t('billing:quoteView.agree')}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function TotalRow({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
      <Text
        variant={muted ? 'caption' : 'label'}
        tone={muted ? 'muted' : 'default'}
        style={{ fontFamily: theme.fontFamily.body }}
      >
        {label}
      </Text>
      <Text
        variant={muted ? 'caption' : 'labelStrong'}
        tone={muted ? 'muted' : 'default'}
        style={{ fontFamily: theme.fontFamily.display }}
      >
        {value}
      </Text>
    </View>
  );
}
