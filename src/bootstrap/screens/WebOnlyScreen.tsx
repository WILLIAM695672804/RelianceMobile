import { useTranslation } from 'react-i18next';

import { useSession, useSessionActions } from '@/core/session';
import { Button, Screen, Text } from '@/shared/components';

/** Administrateur (espace web) ou rôle non reconnu (Document 5, ch. 3). */
export function WebOnlyScreen() {
  const { t } = useTranslation();
  const role = useSession((state) => state.user?.role);
  const { logout } = useSessionActions();

  return (
    <Screen>
      <Text variant="title" accessibilityRole="header">
        {t('common:appName')}
      </Text>
      <Text>
        {role === 'admin' ? t('common:session.webOnly') : t('common:session.unknownRole')}
      </Text>
      <Button label={t('common:actions.logout')} onPress={() => void logout()} />
    </Screen>
  );
}
