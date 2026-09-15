import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppError } from '@/core/errors';
import { useSessionActions } from '@/core/session';
import { Screen, StateView, Text } from '@/shared/components';

const OFFLINE_ERROR = new AppError({ kind: 'network' });

/** E01 — Lancement : restaure la session ; la navigation réagit au changement de statut. */
export function LaunchScreen() {
  const { t } = useTranslation();
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
    <Screen>
      <Text variant="display" tone="primary" accessibilityRole="header">
        {t('common:appName')}
      </Text>
      {offline ? (
        <StateView status="error" error={OFFLINE_ERROR} onRetry={retry} />
      ) : (
        <StateView status="loading" />
      )}
    </Screen>
  );
}
