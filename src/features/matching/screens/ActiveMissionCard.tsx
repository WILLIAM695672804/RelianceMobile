import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Badge, Card, Icon, ListItem, Text } from '@/shared/components';
import { formatAmount } from '@/shared/format';

import type { ActiveMission } from '../schemas/matchingSchemas';

/** Mission acceptée en cours : intitulé, catégorie, client, lieu et montant. */
export function ActiveMissionCard({ mission }: { mission: ActiveMission }) {
  const { t } = useTranslation();
  const place = [mission.address?.address, mission.address?.city].filter(Boolean).join(', ');
  const client = mission.client;
  return (
    <Card elevated>
      <View style={styles.header}>
        <Icon name="wrench" size={22} tone="primary" />
        <Text variant="subtitle" style={styles.title} numberOfLines={2}>
          {mission.request.title}
        </Text>
        <Badge
          label={t('matching:technicianHome.amount', { amount: formatAmount(mission.price) })}
          tone="primary"
          icon="wallet"
        />
      </View>
      {mission.request.category ? <Text tone="muted">{mission.request.category}</Text> : null}
      {client ? (
        <ListItem label={t('matching:technicianHome.client', { name: client.name })} icon="user" />
      ) : null}
      {place ? <ListItem label={t('matching:technicianHome.place', { place })} icon="pin" /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  title: { flex: 1 },
});
