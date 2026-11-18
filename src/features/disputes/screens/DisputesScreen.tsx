import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { formatDate } from '@/shared/format';
import { Card, EmptyState, ListRow, QueryGate, Screen, TopBar } from '@/shared/ui';

import { useDisputes } from '../hooks/useDisputes';
import { DISPUTE_TONES } from '../model/disputeTones';

export interface DisputesScreenProps {
  /** Ouverture du fil d'un litige. */
  onOpen: (disputeId: string) => void;
  onBack?: () => void;
}

/** Litiges ouverts par la personne connectée ou dirigés contre elle. */
export function DisputesScreen({ onOpen, onBack }: DisputesScreenProps) {
  const { t } = useTranslation();
  const disputes = useDisputes();

  return (
    <Screen
      testID="litiges"
      onRefresh={() => void disputes.refetch()}
      refreshing={disputes.isRefetching}
    >
      <TopBar title={t('disputes:list.title')} onBack={onBack} />
      <View style={{ paddingHorizontal: 20 }}>
        <QueryGate queries={[disputes]}>
          {() =>
            (disputes.data ?? []).length === 0 ? (
              <EmptyState
                icon="shield"
                title={t('disputes:list.title')}
                message={t('disputes:list.empty')}
              />
            ) : (
              <Card padding={0}>
                {disputes.data!.map((dispute, index) => {
                  const reason = t(`disputes:reasons.${dispute.reason}`, {
                    defaultValue: dispute.reason,
                  });
                  return (
                    <ListRow
                      key={dispute.id}
                      icon="shield"
                      divider={index > 0}
                      title={reason}
                      detail={[
                        dispute.defendant
                          ? t('disputes:list.against', { name: dispute.defendant.name })
                          : null,
                        dispute.description,
                        dispute.created_at
                          ? t('disputes:list.openedAt', { date: formatDate(dispute.created_at) })
                          : null,
                      ]
                        .filter(Boolean)
                        .join('\n')}
                      pill={{
                        label: t(`disputes:statuses.${dispute.status}`),
                        tone: DISPUTE_TONES[dispute.status],
                      }}
                      accessibilityLabel={t('disputes:list.open', { reason })}
                      onPress={() => onOpen(dispute.id)}
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
