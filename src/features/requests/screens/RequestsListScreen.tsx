import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { formatDate } from '@/shared/format';
import { Card, EmptyState, ListRow, QueryGate, Screen, Text, TopBar } from '@/shared/ui';

import { useRequests } from '../hooks/useRequests';
import { iconForSkillSlug } from '../model/categoryIcons';
import { stageOf, STAGE_TONES } from '../model/requestStage';

export interface RequestsListScreenProps {
  /** Ouverture du détail d'une demande. */
  onOpenRequest: (requestId: string) => void;
  onBack?: () => void;
}

/** Toutes les demandes du client, les plus récentes d'abord. */
export function RequestsListScreen({ onOpenRequest, onBack }: RequestsListScreenProps) {
  const { t } = useTranslation();
  const requests = useRequests();

  return (
    <Screen
      testID="mes-demandes"
      onRefresh={() => void requests.refetch()}
      refreshing={requests.isRefetching}
    >
      <TopBar title={t('requests:list.title')} onBack={onBack} />
      <View style={{ paddingHorizontal: 20, gap: 10 }}>
        <QueryGate queries={[requests]}>
          {() =>
            requests.data!.data.length === 0 ? (
              <EmptyState
                icon="file"
                title={t('requests:list.title')}
                message={t('requests:list.empty')}
              />
            ) : (
              <>
                <Text variant="eyebrow" tone="muted">
                  {t('requests:list.count', { count: requests.data!.meta.total })}
                </Text>
                <Card padding={0}>
                  {requests.data!.data.map((request, index) => {
                    const stage = stageOf(request.status);
                    return (
                      <ListRow
                        key={request.id}
                        icon={iconForSkillSlug(request.category?.slug)}
                        divider={index > 0}
                        title={request.title}
                        detail={t('requests:list.createdAt', {
                          date: formatDate(request.created_at),
                        })}
                        pill={{ label: t(`requests:stages.${stage}`), tone: STAGE_TONES[stage] }}
                        accessibilityLabel={t('requests:list.openNamed', { title: request.title })}
                        onPress={() => onOpenRequest(request.id)}
                      />
                    );
                  })}
                </Card>
              </>
            )
          }
        </QueryGate>
      </View>
    </Screen>
  );
}
