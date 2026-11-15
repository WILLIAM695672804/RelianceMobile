import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/core/theme';
import { formatAmount } from '@/shared/format';
import { totalsOf, type LineItem } from '@/shared/model';
import { Button, DetailHeader, Icon, Screen, Text } from '@/shared/ui';

export interface InvoiceDocument {
  number: string;
  status: 'paid' | 'pending';
  issuedOn: string;
  issuer: { name: string; lines: readonly string[] };
  recipient: { name: string; lines: readonly string[] };
  lines: readonly LineItem[];
  feeRate: number;
  /** Mentions de pied de page (référence de paiement, raison sociale). */
  footer: readonly string[];
}

export interface InvoiceViewProps {
  invoice: InvoiceDocument;
  downloading?: boolean;
  onBack: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

/** Facture au format document (maquette `InvoiceScreen`), présentation pure. */
export function InvoiceView({
  invoice,
  downloading = false,
  onBack,
  onDownload,
  onShare,
}: InvoiceViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const dark = theme.scheme === 'dark';
  const totals = totalsOf(invoice.lines, invoice.feeRate);

  return (
    <Screen
      testID="facture"
      footer={
        onDownload || onShare ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {onShare ? (
              <View style={{ flex: 1 }}>
                <Button
                  label={t('billing:invoiceView.share')}
                  icon="send"
                  variant="ghost"
                  size="lg"
                  full
                  onPress={onShare}
                />
              </View>
            ) : null}
            {onDownload ? (
              <View style={{ flex: 1 }}>
                <Button
                  label={t('billing:invoiceView.download')}
                  icon="upload"
                  size="lg"
                  full
                  loading={downloading}
                  onPress={onDownload}
                />
              </View>
            ) : null}
          </View>
        ) : undefined
      }
    >
      <DetailHeader
        eyebrow={t('billing:invoiceView.eyebrow')}
        title={invoice.number}
        onBack={onBack}
        trailing={
          onDownload ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('billing:invoiceView.download')}
              onPress={onDownload}
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: theme.colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="upload" size={16} tone="onPrimary" />
            </Pressable>
          ) : undefined
        }
      />
      <View style={{ padding: 16, backgroundColor: dark ? '#0e0e12' : '#f0f0f3', flexGrow: 1 }}>
        <View
          style={{
            padding: 24,
            borderRadius: 12,
            backgroundColor: dark ? '#16161b' : '#ffffff',
            boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.1)',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              paddingBottom: 16,
              marginBottom: 20,
              borderBottomWidth: 2,
              borderBottomColor: theme.colors.text,
            }}
          >
            <View>
              <Text
                variant="headline"
                style={{ fontSize: 26, lineHeight: 28, letterSpacing: -0.8 }}
              >
                RELIANCE
              </Text>
              <Text variant="caption" tone="muted" style={{ fontSize: 10, marginTop: 4 }}>
                {t('billing:invoiceView.tagline')}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 6,
                  backgroundColor:
                    invoice.status === 'paid' ? theme.colors.success : theme.colors.warning,
                }}
              >
                <Text
                  variant="eyebrow"
                  style={{ color: '#ffffff', fontSize: 10, letterSpacing: 1 }}
                >
                  {t(`billing:invoiceView.status.${invoice.status}`)}
                </Text>
              </View>
              <Text variant="caption" tone="muted" style={{ fontSize: 10, marginTop: 6 }}>
                {invoice.issuedOn}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 16, marginBottom: 22 }}>
            {[
              { title: t('billing:invoiceView.from'), party: invoice.issuer },
              { title: t('billing:invoiceView.to'), party: invoice.recipient },
            ].map(({ title, party }) => (
              <View key={title} style={{ flex: 1 }}>
                <Text
                  variant="eyebrow"
                  tone="muted"
                  style={{ fontSize: 9, letterSpacing: 1, marginBottom: 4 }}
                >
                  {title}
                </Text>
                <Text
                  variant="caption"
                  style={{ color: theme.colors.text, fontFamily: theme.fontFamily.bodyBold }}
                >
                  {party.name}
                </Text>
                {party.lines.map((line) => (
                  <Text
                    key={line}
                    variant="caption"
                    tone="muted"
                    style={{ fontSize: 10, lineHeight: 15 }}
                  >
                    {line}
                  </Text>
                ))}
              </View>
            ))}
          </View>

          <View
            style={{
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: 8,
              overflow: 'hidden',
              marginBottom: 14,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                paddingHorizontal: 10,
                paddingVertical: 8,
                backgroundColor: theme.colors.surfaceMuted,
              }}
            >
              <HeadCell flex={2}>{t('billing:invoiceView.designation')}</HeadCell>
              <HeadCell width={30}>{t('billing:invoiceView.quantity')}</HeadCell>
              <HeadCell width={64}>{t('billing:invoiceView.unit')}</HeadCell>
              <HeadCell width={64}>{t('billing:invoiceView.lineTotal')}</HeadCell>
            </View>
            {invoice.lines.map((line) => (
              <View
                key={line.label}
                style={{
                  flexDirection: 'row',
                  padding: 10,
                  borderTopWidth: 1,
                  borderTopColor: theme.colors.divider,
                }}
              >
                <Cell flex={2}>{line.label}</Cell>
                <Cell width={30}>{String(line.quantity)}</Cell>
                <Cell width={64}>{formatAmount(line.unitPrice).replace(/\s?FCFA$/, '')}</Cell>
                <Cell width={64} strong>
                  {formatAmount(line.quantity * line.unitPrice).replace(/\s?FCFA$/, '')}
                </Cell>
              </View>
            ))}
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <View style={{ width: 210 }}>
              <SumRow
                label={t('billing:invoiceView.subtotal')}
                value={formatAmount(totals.subtotal)}
              />
              {totals.fee > 0 ? (
                <SumRow
                  label={t('billing:invoiceView.fee', { rate: Math.round(invoice.feeRate * 100) })}
                  value={formatAmount(totals.fee)}
                />
              ) : null}
              <View style={{ height: 1, backgroundColor: theme.colors.text, marginVertical: 6 }} />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  paddingVertical: 6,
                }}
              >
                <Text
                  variant="caption"
                  style={{ color: theme.colors.text, fontFamily: theme.fontFamily.bodyBold }}
                >
                  {t('billing:invoiceView.total')}
                </Text>
                <Text
                  variant="section"
                  style={{ fontFamily: theme.fontFamily.display, fontSize: 18 }}
                >
                  {formatAmount(totals.total)}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={{
              marginTop: 30,
              paddingTop: 14,
              borderTopWidth: 1,
              borderTopColor: theme.colors.divider,
            }}
          >
            {invoice.footer.map((line) => (
              <Text
                key={line}
                variant="caption"
                tone="muted"
                align="center"
                style={{ fontSize: 9, lineHeight: 14 }}
              >
                {line}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </Screen>
  );
}

function HeadCell({ children, flex, width }: { children: string; flex?: number; width?: number }) {
  return (
    <Text
      variant="eyebrow"
      tone="muted"
      style={{ flex, width, fontSize: 9, letterSpacing: 1, textAlign: width ? 'right' : 'left' }}
    >
      {children}
    </Text>
  );
}

function Cell({
  children,
  flex,
  width,
  strong = false,
}: {
  children: string;
  flex?: number;
  width?: number;
  strong?: boolean;
}) {
  const theme = useTheme();
  return (
    <Text
      variant="caption"
      style={{
        flex,
        width,
        fontSize: 11,
        color: theme.colors.text,
        textAlign: width ? 'right' : 'left',
        fontFamily: width
          ? strong
            ? theme.fontFamily.bodySemiBold
            : theme.fontFamily.body
          : theme.fontFamily.body,
      }}
    >
      {children}
    </Text>
  );
}

function SumRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
      <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
        {label}
      </Text>
      <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
        {value}
      </Text>
    </View>
  );
}
