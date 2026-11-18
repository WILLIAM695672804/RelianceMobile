import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { formatAmount, formatDate } from '@/shared/format';
import { Card, EmptyState, ListRow, QueryGate, Screen, TopBar } from '@/shared/ui';

import { useInvoices } from '../hooks/useBilling';
import { invoiceToneOf } from '../model/quoteStatus';

export interface InvoicesScreenProps {
  /** Ouverture du détail d'une facture. */
  onOpen: (invoiceId: string) => void;
  onBack?: () => void;
}

/** E22 — Factures reçues et émises. */
export function InvoicesScreen({ onOpen, onBack }: InvoicesScreenProps) {
  const { t } = useTranslation();
  const invoices = useInvoices();

  return (
    <Screen
      testID="factures"
      onRefresh={() => void invoices.refetch()}
      refreshing={invoices.isRefetching}
    >
      <TopBar title={t('billing:invoices.title')} onBack={onBack} />
      <View style={{ paddingHorizontal: 20 }}>
        <QueryGate queries={[invoices]}>
          {() =>
            invoices.data!.invoices.length === 0 ? (
              <EmptyState
                icon="file"
                title={t('billing:invoices.title')}
                message={t('billing:invoices.empty')}
              />
            ) : (
              <Card padding={0}>
                {invoices.data!.invoices.map((entry, index) => {
                  const title = entry.reference
                    ? t('billing:invoices.reference', { reference: entry.reference })
                    : t('billing:invoices.noReference');
                  return (
                    <ListRow
                      key={entry.id}
                      icon="file"
                      divider={index > 0}
                      title={title}
                      detail={[
                        t('billing:invoices.amount', { amount: formatAmount(entry.amount) }),
                        entry.created_at
                          ? t('billing:invoices.issuedAt', { date: formatDate(entry.created_at) })
                          : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                      pill={{
                        label: t(`billing:invoiceStatus.${entry.status}`),
                        tone: invoiceToneOf(entry.status),
                      }}
                      accessibilityLabel={`${t('billing:invoices.open')} : ${title}`}
                      onPress={() => onOpen(entry.id)}
                    />
                  );
                })}
              </Card>
            )
          }
        </QueryGate>
      </View>
    </Screen>
  );
}
