import { useTranslation } from 'react-i18next';

import { useSession, useSessionActions } from '@/core/session';
import { Button, Card, Screen, Text } from '@/shared/components';

/** Compte : profil minimal et déconnexion. */
export function AccountScreen() {
  const { t } = useTranslation();
  const user = useSession((state) => state.user);
  const { logout } = useSessionActions();

  return (
    <Screen scroll>
      <Text variant="title" accessibilityRole="header">
        {t('common:account.title')}
      </Text>
      <Card>
        <Text variant="subtitle">{user?.name}</Text>
        <Text tone="muted">{t('common:account.email')}</Text>
        <Text>{user?.email}</Text>
        <Text tone="muted">{t('common:account.role')}</Text>
        <Text>{t(`common:roles.${user?.role ?? 'unknown'}`)}</Text>
      </Card>
      <Button
        label={t('common:actions.logout')}
        onPress={() => void logout()}
        variant="secondary"
      />
    </Screen>
  );
}
