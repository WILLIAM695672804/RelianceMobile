import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useIsOnline } from '@/core/offline';
import { useTheme } from '@/core/theme';

import { Icon } from './Icon';
import { Text } from './Text';

/** Bandeau affiché en tête d'écran tant que l'appareil est hors ligne. */
export function OfflineBanner() {
  const online = useIsOnline();
  const theme = useTheme();
  const { t } = useTranslation();
  if (online) return null;
  return (
    <View
      accessible
      accessibilityRole="alert"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginHorizontal: 16,
        marginTop: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: theme.tint.warning,
      }}
    >
      <Icon name="info" size={16} tone="warning" />
      <Text variant="caption" style={{ flex: 1 }}>
        {t('common:offline.banner')}
      </Text>
    </View>
  );
}
