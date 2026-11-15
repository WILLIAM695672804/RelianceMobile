import type { ReactNode } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/core/theme';

import { BackButton } from './BackButton';
import { Text } from './Text';

export interface DetailHeaderProps {
  /** Référence au-dessus du titre (« Mission #M-2847 »). */
  eyebrow?: string;
  title: string;
  onBack?: () => void;
  trailing?: ReactNode;
}

/** En-tête des écrans de détail : retour, surtitre, titre, action ; filet inférieur. */
export function DetailHeader({ eyebrow, title, onBack, trailing }: DetailHeaderProps) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      {onBack ? <BackButton onPress={onBack} /> : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        {eyebrow ? (
          <Text variant="eyebrow" tone="muted" numberOfLines={1} style={{ letterSpacing: 1 }}>
            {eyebrow}
          </Text>
        ) : null}
        <Text
          variant="bodyStrong"
          accessibilityRole="header"
          numberOfLines={1}
          style={{ fontFamily: theme.fontFamily.display, letterSpacing: -0.3 }}
        >
          {title}
        </Text>
      </View>
      {trailing}
    </View>
  );
}
