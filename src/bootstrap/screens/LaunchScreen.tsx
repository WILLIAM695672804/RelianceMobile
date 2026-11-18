import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { useSessionActions } from '@/core/session';
import { useTheme } from '@/core/theme';
import { ErrorState, Screen, Text } from '@/shared/ui';

/** E01 — Lancement : restaure la session ; la navigation réagit au changement de statut. */
export function LaunchScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { restore } = useSessionActions();
  const [offline, setOffline] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void restore().then((outcome) => {
      if (!cancelled && outcome === 'offline') setOffline(true);
    });
    return () => {
      cancelled = true;
    };
  }, [restore, attempt]);

  const retry = () => {
    setOffline(false);
    setAttempt((count) => count + 1);
  };

  return (
    <Screen scroll={false} testID="lancement">
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <Text
          variant="display"
          tone="primary"
          accessibilityRole="header"
          style={{ fontFamily: theme.fontFamily.display, fontSize: 40, lineHeight: 44 }}
        >
          {t('common:appName')}
        </Text>
        {offline ? (
          <ErrorState kind="network" onRetry={retry} />
        ) : (
          <ActivityIndicator
            color={theme.colors.primary}
            size="large"
            accessibilityLabel={t('common:states.loading')}
          />
        )}
      </View>
    </Screen>
  );
}
