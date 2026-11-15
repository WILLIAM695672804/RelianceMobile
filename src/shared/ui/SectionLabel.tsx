import { View } from 'react-native';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

/** Intitulé de rubrique en capitales, avec icône d'accent facultative (« CONSTAT SUR PLACE »). */
export function SectionLabel({ label, icon }: { label: string; icon?: IconName }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      {icon ? <Icon name={icon} size={14} tone="primary" /> : null}
      <Text variant="eyebrow" tone="muted" style={{ letterSpacing: 1 }}>
        {label}
      </Text>
    </View>
  );
}
