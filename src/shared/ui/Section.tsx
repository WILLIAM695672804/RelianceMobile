import type { ReactNode } from 'react';
import { View } from 'react-native';

import { useResponsive } from '@/core/responsive';

import { Text } from './Text';

export interface SectionProps {
  title?: string;
  /** Lien ou bouton aligné à droite du titre. */
  action?: ReactNode;
  children: ReactNode;
  testID?: string;
}

/** Bloc titré des maquettes : titre de 17 points dans la gouttière, contenu libre. */
export function Section({ title, action, children, testID }: SectionProps) {
  const { gutter } = useResponsive();
  return (
    <View testID={testID} style={{ marginBottom: 24 }}>
      {title ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: gutter,
            marginBottom: 12,
            minHeight: 24,
          }}
        >
          <Text variant="section" accessibilityRole="header">
            {title}
          </Text>
          {action}
        </View>
      ) : null}
      {children}
    </View>
  );
}
