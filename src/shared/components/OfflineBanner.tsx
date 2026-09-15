import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { useIsOnline } from '@/core/offline';
import { useTheme } from '@/core/theme';

import { Text } from './Text';

/** Bandeau affiché tant que l'appareil est hors ligne. */
export function OfflineBanner() {
  const online = useIsOnline();
  const theme = useTheme();
  const { t } = useTranslation();
  if (online) return null;
  return (
    <View
      accessible
      accessibilityRole="alert"
      style={[styles.banner, { backgroundColor: theme.colors.warning }]}
    >
      <Text variant="caption" tone="default">
        {t('common:offline.banner')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { paddingHorizontal: 16, paddingVertical: 8 },
});
