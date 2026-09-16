import { useTranslation } from 'react-i18next';

import { Card, Text } from '@/shared/components';
import { formatAmount } from '@/shared/format';

import type { ActiveMission } from '../schemas/matchingSchemas';

/** Mission acceptée en cours : intitulé, catégorie, client, lieu et montant. */
export function ActiveMissionCard({ mission }: { mission: ActiveMission }) {
  const { t } = useTranslation();
  const place = [mission.address?.address, mission.address?.city].filter(Boolean).join(', ');
  return (
    <Card>
      <Text variant="subtitle">{mission.request.title}</Text>
      {mission.request.category ? <Text tone="muted">{mission.request.category}</Text> : null}
      {mission.client ? (
        <Text>{t('matching:technicianHome.client', { name: mission.client.name })}</Text>
      ) : null}
      {place ? <Text>{t('matching:technicianHome.place', { place })}</Text> : null}
      <Text>{t('matching:technicianHome.amount', { amount: formatAmount(mission.price) })}</Text>
    </Card>
  );
}
